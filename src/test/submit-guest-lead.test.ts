// @vitest-environment node
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

let compiledHandler: string
beforeAll(async () => {
  const sourceFile = resolve(__dirname, '../../supabase/functions/submit-guest-lead/index.ts')
  const source = (await readFile(sourceFile, 'utf8'))
    .replace(/^import \{ createClient \} from [^\n]+;/m, 'const createClient = () => globalThis.__guestClient;')
  const compiled = await build({
    stdin: { contents: source, sourcefile: sourceFile, resolveDir: dirname(sourceFile), loader: 'ts' },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
  })
  compiledHandler = Buffer.from(compiled.outputFiles[0].text).toString('base64')
}, 30000)

// Run the production handler with local database doubles. Block all email/network requests.
async function guestHandler() {
  const rpc = vi.fn(async (name: string) => ({
    data: name === 'create_guest_project' ? [{ lead_id: 'lead', project_id: 'project' }] : true, error: null,
  }))
  const query = {
    select: vi.fn(() => query), eq: vi.fn(() => query),
    gte: vi.fn(async () => ({ count: 0, error: null })),
    insert: vi.fn(async () => ({ error: null })),
  }
  vi.stubGlobal('__guestClient', { rpc, from: () => query })
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network forbidden in this test')))
  let handler: (request: Request) => Promise<Response>
  vi.stubGlobal('Deno', {
    serve: (callback: typeof handler) => { handler = callback },
    env: { get: (key: string) => ({ SUPABASE_URL: 'https://local.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-service' })[key] },
  })
  vi.spyOn(console, 'log').mockImplementation(() => {})
  await import(/* @vite-ignore */ `data:text/javascript;base64,${compiledHandler}#${Math.random()}`)
  return { rpc, submit: (category: string) => handler(new Request('https://local.invalid/submit-guest-lead', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, email: 'test@example.test', title: 'Google Ads campaign', description: 'Help with Google Ads for our store.', budget_range: 'unknown', start_time: 'flexible' }),
  })) }
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('persists a Google Ads brief without silently changing its category', async () => {
  const { rpc, submit } = await guestHandler()
  const response = await submit('Google Ads')
  expect(response.status).toBe(201)
  expect(await response.json()).toMatchObject({ success: true, project_id: 'project' })
  expect(rpc).toHaveBeenCalledWith('create_guest_project', expect.objectContaining({ p_category: 'Google Ads' }))
  expect(fetch).not.toHaveBeenCalled()
})

it('rejects an unknown category instead of falling back to digital marketing', async () => {
  const { rpc, submit } = await guestHandler()
  expect((await submit('Unknown category')).status).toBe(400)
  expect(rpc).not.toHaveBeenCalled()
})
