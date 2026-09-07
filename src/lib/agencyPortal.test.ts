import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() },
}));
import {
  invoiceBasis,
  priceToOre,
  safeDeliveryUrl,
  type AgencyPortal,
} from "./agencyPortal";
describe("agency portal financial and link boundaries", () => {
  it("converts decimal SEK to exact integer öre", () => {
    expect(priceToOre("2500,50")).toBe(250050);
    expect(priceToOre("0.01")).toBe(1);
    expect(priceToOre("10")).toBe(1000);
  });
  it.each(["-1", "1e3", "1.001", "NaN", "", "10000000.01"])(
    "rejects ambiguous or excessive price %s",
    (raw) => {
      expect(() => priceToOre(raw)).toThrow();
    },
  );
  it("allows only https delivery links without embedded credentials", () => {
    expect(safeDeliveryUrl("https://example.test/v1.pdf")).toBe(
      "https://example.test/v1.pdf",
    );
    for (const raw of [
      "javascript:alert(1)",
      "//example.test",
      "http://example.test",
      "https://user:pass@example.test",
    ])
      expect(safeDeliveryUrl(raw)).toBeNull();
  });
  it("exports only approved extras with their immutable prices and approval evidence", () => {
    const base = {
      description: "Agreed scope",
      currency: "SEK",
      createdAt: "2026-09-07T12:00:00Z",
      decision: {
        actor: "Kund via delningslänk",
        at: "2026-09-07T12:00:00Z",
        text: "",
      },
    };
    const portal = {
      id: "portal-1",
      title: "Website",
      clientName: "Client",
      extras: [
        {
          ...base,
          id: "extra-1",
          title: "Approved page",
          priceOre: 120050,
          status: "approved",
        },
        {
          ...base,
          id: "extra-2",
          title: "Pending logo",
          priceOre: 999999,
          status: "proposed",
        },
        {
          ...base,
          id: "extra-3",
          title: "Declined ad",
          priceOre: 999999,
          status: "declined",
        },
      ],
    } as AgencyPortal;
    const text = invoiceBasis(portal);
    expect(text).toContain("Approved page");
    expect(text).toContain("extra-1");
    expect(text).toContain("Kund via delningslänk");
    expect(text).toContain("tidigare fakturering");
    expect(text).not.toContain("Pending logo");
    expect(text).not.toContain("Declined ad");
  });
});
