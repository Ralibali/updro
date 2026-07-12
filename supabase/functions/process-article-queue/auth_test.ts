import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { safeEqual, verifyCronRequest } from "./index.ts";

Deno.test("safeEqual: equal strings", () => {
  assertEquals(safeEqual("abc123", "abc123"), true);
});

Deno.test("safeEqual: different strings", () => {
  assertEquals(safeEqual("abc123", "abc124"), false);
});

Deno.test("safeEqual: different lengths", () => {
  assertEquals(safeEqual("abc", "abcd"), false);
});

Deno.test("verifyCronRequest: missing server secret -> 500", () => {
  const req = new Request("https://x/", { method: "POST", headers: { "x-cron-secret": "s" } });
  const res = verifyCronRequest(req, undefined);
  assertEquals(res?.status, 500);
});

Deno.test("verifyCronRequest: missing header -> 401", () => {
  const req = new Request("https://x/", { method: "POST" });
  const res = verifyCronRequest(req, "secret-value");
  assertEquals(res?.status, 401);
});

Deno.test("verifyCronRequest: wrong header -> 401", () => {
  const req = new Request("https://x/", { method: "POST", headers: { "x-cron-secret": "nope" } });
  const res = verifyCronRequest(req, "secret-value");
  assertEquals(res?.status, 401);
});

Deno.test("verifyCronRequest: correct header -> null (authorised)", () => {
  const req = new Request("https://x/", { method: "POST", headers: { "x-cron-secret": "secret-value" } });
  const res = verifyCronRequest(req, "secret-value");
  assertEquals(res, null);
});
