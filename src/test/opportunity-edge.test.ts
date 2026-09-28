// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// Compile the production handler with only its Supabase client factory replaced.
// All network I/O is mocked; these tests cannot write to a live database or send mail.
async function handler(name: string, client: unknown, environment: Record<string, string> = {}) {
  const sourceFile = resolve(__dirname, `../../supabase/functions/${name}/index.ts`);
  const source = (await readFile(sourceFile, "utf8")).replace(/^import \{ createClient \} from [^\n]+;/m, "const createClient = () => globalThis.__opportunityTestClient;");
  const compiled = await build({ stdin: { contents: source, sourcefile: sourceFile, resolveDir: dirname(sourceFile), loader: "ts" }, bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  let serve: (request: Request) => Promise<Response>;
  vi.stubGlobal("__opportunityTestClient", client);
  vi.stubGlobal("Deno", { env: { get: (key: string) => ({ SUPABASE_URL: "https://local.invalid", SUPABASE_SERVICE_ROLE_KEY: "local-test-key", ...environment })[key] }, serve: (fn: typeof serve) => { serve = fn; } });
  await import(/* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}#${Math.random()}`);
  return (body: unknown, headers: Record<string, string> = {}) => serve(new Request("https://local.invalid/function", { method: "POST", headers: { "Content-Type": "application/json", origin: "https://auroramedia.se", "x-forwarded-for": "local-test", ...headers }, body: JSON.stringify(body) }));
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const headers = { authorization: 'Bearer local-user' };
const env = { AI_VISIBILITY_ENABLED: 'true', PERPLEXITY_API_KEY: 'test-key' };
function client(admin = true, duplicate = false) {
  const saved = { id: 'workspace', workspace: { questions: 'Vilken byrå?' } };
  const update = vi.fn(() => ({ eq: async () => ({ error: null }) }));
  const project = { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: saved }) }) }) };
  const checks = { insert: () => ({ select: () => ({ single: async () => duplicate ? { error: { code: '23505' } } : { data: { id: 'check' } } }) }), update };
  return { auth: { getUser: async () => ({ data: { user: { id: 'admin' } } }) }, rpc: async () => ({ data: admin }), from: (table: string) => table === 'ai_visibility_workspaces' ? project : checks, update };
}
describe('Visibility provider API', () => {
  it('rejects ordinary users and remains disabled without explicit activation', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect((await (await handler('ai-visibility-check', client(false), env))({}, headers)).status).toBe(403);
    expect((await (await handler('ai-visibility-check', client(), {}))({}, headers)).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('prevents duplicate paid calls and disallows prompts not saved in the workspace', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const submit = await handler('ai-visibility-check', client(true, true), env);
    expect((await submit({ workspaceId: 'workspace', prompt: 'Vilken byrå?' }, headers)).status).toBe(409);
    expect((await submit({ workspaceId: 'workspace', prompt: 'Unknown prompt' }, headers)).status).toBe(400);
    expect((await submit(null, headers)).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('stores actual answers and citations, and records provider failure without zero scores', async () => {
    const db = client();
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ model: 'sonar', choices: [{ message: { content: 'Ett verifierbart testsvar' } }], citations: ['https://example.test', 'javascript:bad'] })));
    vi.stubGlobal('fetch', fetch);
    const submit = await handler('ai-visibility-check', db, env);
    const response = await submit({ workspaceId: 'workspace', prompt: 'Vilken byrå?' }, headers);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ answer: 'Ett verifierbart testsvar', citations: ['https://example.test'] });
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'complete' }));
    fetch.mockResolvedValue(new Response('', { status: 429 }));
    expect((await submit({ workspaceId: 'workspace', prompt: 'Vilken byrå?' }, headers)).status).toBe(502);
    expect(db.update).toHaveBeenCalledWith({ status: 'failed' });
  });
});
