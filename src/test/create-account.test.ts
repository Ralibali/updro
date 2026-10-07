// @vitest-environment node
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { existingAccountMessage, signupAuthErrorMessage } from "../../supabase/functions/create-account/auth-errors.ts";

const signup = {
  email: "registration@example.test",
  password: "local-test-password",
  role: "supplier",
  full_name: "Registration Test",
  company_name: "Testbyrå",
  categories: ["Webbutveckling"],
};

let compiledHandler: string;
beforeAll(async () => {
  const sourceFile = resolve(__dirname, "../../supabase/functions/create-account/index.ts");
  const source = (await readFile(sourceFile, "utf8"))
    .replace(/^import \{ serve \} from [^\n]+;/m, "const serve = globalThis.__registrationServe;")
    .replace(/^import \{ createClient \} from [^\n]+;/m, "const createClient = () => globalThis.__registrationClient;");
  const compiled = await build({
    stdin: { contents: source, sourcefile: sourceFile, resolveDir: dirname(sourceFile), loader: "ts" },
    bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
  });
  compiledHandler = Buffer.from(compiled.outputFiles[0].text).toString("base64");
}, 30000);

// Execute the production handler while replacing its network clients. No live
// accounts, database rows or email are created by these regression tests.
async function registrationHandler(authResult: unknown, profileError: unknown = null) {
  const insert = vi.fn().mockResolvedValue({ error: profileError });
  const from = vi.fn((_table: string) => ({ insert }));
  const deleteUser = vi.fn();
  const client = {
    auth: { signUp: vi.fn().mockResolvedValue(authResult), admin: { deleteUser } },
    rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
    from,
  };
  let serve: (request: Request) => Promise<Response>;
  vi.stubGlobal("__registrationClient", client);
  vi.stubGlobal("__registrationServe", (handler: typeof serve) => { serve = handler; });
  vi.stubGlobal("Deno", { env: { get: (key: string) => ({
    SUPABASE_URL: "https://local.invalid", SUPABASE_ANON_KEY: "test-anon", SUPABASE_SERVICE_ROLE_KEY: "test-service",
  })[key] } });
  vi.spyOn(console, "error").mockImplementation(() => {});
  await import(/* @vite-ignore */ `data:text/javascript;base64,${compiledHandler}#${Math.random()}`);
  return {
    client, insert, deleteUser, from,
    submit: (overrides: Partial<typeof signup> = {}) => serve(new Request("https://local.invalid/create-account", {
      method: "POST", headers: { "Content-Type": "application/json", origin: "https://updro.se" }, body: JSON.stringify({ ...signup, ...overrides }),
    })),
  };
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("registration auth errors", () => {
  it("explains password length and character requirements without assuming the password was leaked", () => {
    const message = signupAuthErrorMessage({
      code: "weak_password", message: "Password should be at least 12 characters.", reasons: ["length", "characters"],
    });
    expect(message).toContain("minst 12 tecken");
    expect(message).toContain("teckenkraven");
    expect(message).not.toContain("dataläckor");
  });

  it("recognizes the weak-password class and leaked-password reason even when message wording changes", () => {
    expect(signupAuthErrorMessage({ name: "AuthWeakPasswordError", message: "new wording", reasons: ["pwned"] }))
      .toContain("dataläckor");
  });

  it.each([
    ["over_email_send_rate_limit", "bekräftelsemejl"],
    ["over_request_rate_limit", "Vänta några minuter"],
    ["email_address_invalid", "Kontrollera stavningen"],
    ["email_address_not_authorized", "Mejltjänsten behöver åtgärdas"],
    ["signup_disabled", "tillfälligt avstängd"],
    ["email_provider_disabled", "tillfälligt avstängd"],
    ["captcha_failed", "Säkerhetskontrollen"],
    ["hook_timeout", "tog för lång tid"],
    ["request_timeout", "tog för lång tid"],
    ["user_already_exists", "Logga in eller"],
    ["email_exists", "Logga in eller"],
  ])("provides actionable advice for %s without matching the English message", (code, expected) => {
    expect(signupAuthErrorMessage({ code, message: "changed upstream wording" })).toContain(expected);
  });

  it("does not expose raw server errors or blame valid account details", () => {
    const message = signupAuthErrorMessage({ code: "unexpected_failure", status: 500, message: "internal provider details" });
    expect(message).toContain("Registreringstjänsten");
    expect(message).not.toContain("internal provider details");
    expect(message).not.toContain("Kontrollera uppgifterna");
  });
});

describe("create-account handler", () => {
  it("returns the password-policy reason to the form and never writes profiles after Auth rejection", async () => {
    const handler = await registrationHandler({ data: { user: null }, error: {
      code: "weak_password", name: "AuthWeakPasswordError", status: 422,
      message: "Password should contain at least one character of each group.", reasons: ["characters"],
    } });
    const response = await handler.submit();
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("teckenkraven") });
    expect(handler.from).not.toHaveBeenCalled();
    expect(handler.deleteUser).not.toHaveBeenCalled();
  });

  it("stops an obfuscated duplicate before profile insertion or user cleanup", async () => {
    const handler = await registrationHandler({ data: { user: { id: "obfuscated-user", identities: [] }, session: null }, error: null });
    const response = await handler.submit();
    expect(await response.json()).toEqual({ error: existingAccountMessage });
    expect(handler.from).not.toHaveBeenCalled();
    expect(handler.deleteUser).not.toHaveBeenCalled();
  });

  it("preserves an existing unconfirmed account when its profile already exists", async () => {
    const handler = await registrationHandler({ data: { user: { id: "existing-user", identities: [{ id: "identity" }] }, session: null }, error: null }, { code: "23505" });
    expect(await (await handler.submit()).json()).toEqual({ error: existingAccountMessage });
    expect(handler.from).toHaveBeenCalledTimes(1);
    expect(handler.deleteUser).not.toHaveBeenCalled();
  });

  it("still creates a new supplier profile with five trial credits", async () => {
    const handler = await registrationHandler({ data: { user: { id: "new-supplier", identities: [{ id: "identity" }] }, session: null }, error: null });
    expect(await (await handler.submit()).json()).toMatchObject({ userId: "new-supplier", needsEmailConfirmation: true });
    expect(handler.from.mock.calls.map(([table]) => table)).toEqual(["profiles", "supplier_profiles"]);
    expect(handler.insert).toHaveBeenLastCalledWith(expect.objectContaining({ id: "new-supplier", plan: "trial", lead_credits: 5 }));
    expect(handler.deleteUser).not.toHaveBeenCalled();
  });

  it("stores Google Ads as its own supplier category for lead matching", async () => {
    const handler = await registrationHandler({ data: { user: { id: "ads-supplier", identities: [{ id: "identity" }] }, session: null }, error: null });
    const response = await handler.submit({ categories: ["Google Ads"] });
    expect(response.status).toBe(200);
    expect(handler.insert).toHaveBeenLastCalledWith(expect.objectContaining({ categories: ["Google Ads"] }));
  });
});
