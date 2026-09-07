import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const note = z.object({ actor: z.string(), at: z.string(), text: z.string() });
const delivery = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  brief: z.string(),
  createdAt: z.string(),
  feedback: z.array(note),
  decision: note
    .extend({ status: z.enum(["approved", "changes_requested"]) })
    .nullable(),
});
const extra = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  priceOre: z.number().int().nonnegative().max(1_000_000_000),
  currency: z.literal("SEK"),
  status: z.enum(["proposed", "approved", "declined", "withdrawn"]),
  createdAt: z.string(),
  decision: note.nullable(),
});
export const portalSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  clientName: z.string(),
  agencyName: z.string(),
  ownerContact: z.string(),
  clientContact: z.string().nullable(),
  brief: z.string(),
  deliveries: z.array(delivery),
  extras: z.array(extra),
  history: z.array(note),
  revision: z.number().int().positive(),
  isOpen: z.boolean(),
  isOwner: z.boolean(),
  sourceOfferId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  linkExpiresAt: z.string().nullable(),
  newLinkToken: z.string().uuid().optional(),
});
const summarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  clientName: z.string(),
  isOpen: z.boolean(),
  updatedAt: z.string(),
});
export type AgencyPortal = z.infer<typeof portalSchema>;
export type PortalSummary = z.infer<typeof summarySchema>;
export type PortalAction =
  | "brief"
  | "details"
  | "delivery"
  | "feedback"
  | "delivery_decision"
  | "extra"
  | "extra_decision"
  | "withdraw_extra"
  | "create_link"
  | "revoke_link"
  | "close"
  | "reopen";
const rpc = supabase as unknown as {
  rpc(
    name: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
};
async function call(name: string, args?: Record<string, unknown>) {
  const result = await rpc.rpc(name, args);
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export async function listPortals() {
  return z.array(summarySchema).parse(await call("list_agency_portals"));
}
export async function getPortal(id: string | null, token?: string) {
  return portalSchema.parse(
    await call("get_agency_portal", { p_id: id, p_token: token || null }),
  );
}
export async function createPortal(
  id: string,
  data: Record<string, unknown>,
  offerId?: string,
) {
  return portalSchema.parse(
    await call("create_agency_portal", {
      p_id: id,
      p_data: data,
      p_source_offer_id: offerId || null,
    }),
  );
}
export async function changePortal(
  id: string,
  revision: number,
  action: PortalAction,
  data: Record<string, unknown>,
  token?: string,
) {
  return portalSchema.parse(
    await call("change_agency_portal", {
      p_id: id,
      p_expected_revision: revision,
      p_action: action,
      p_data: data,
      p_token: token || null,
    }),
  );
}
export function safeDeliveryUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function priceToOre(raw: string): number {
  const text = raw.trim().replace(",", ".");
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(text))
    throw new Error("Ange ett pris i kronor med högst två decimaler.");
  const [whole, fraction = ""] = text.split(".");
  const ore = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (ore > 1_000_000_000)
    throw new Error("Priset får vara högst 10 000 000 kr.");
  return ore;
}
export const portalMoney = (ore: number) =>
  (ore / 100).toLocaleString("sv-SE", { style: "currency", currency: "SEK" });
export const portalDate = (date: string) =>
  new Date(date).toLocaleString("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
export function invoiceBasis(portal: AgencyPortal): string {
  const approved = portal.extras.filter(
    (item) => item.status === "approved" && item.decision,
  );
  return [
    `Fakturaunderlag – godkända tillägg`,
    `${portal.title} · ${portal.clientName}`,
    `Portal: ${portal.id}`,
    "Samtliga belopp i SEK exklusive moms. Kontrollera utfört arbete och tidigare fakturering före fakturering.",
    "",
    ...approved.flatMap((item) => [
      `${item.title}: ${portalMoney(item.priceOre)}`,
      item.description,
      `Tillägg: ${item.id}`,
      `Godkänt ${portalDate(item.decision!.at)} av ${item.decision!.actor}`,
      "",
    ]),
    `Totalt godkända tillägg: ${portalMoney(approved.reduce((sum, item) => sum + item.priceOre, 0))} exkl. moms`,
  ].join("\n");
}
