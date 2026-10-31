// @vitest-environment node
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

let compiledHandler: string
beforeAll(async () => {
  const sourceFile = resolve(__dirname, '../../supabase/functions/send-notification-emails/index.ts')
  const source = (await readFile(sourceFile, 'utf8'))
    .replace(/^import \{ createClient \} from [^\n]+$/m, 'const createClient = () => globalThis.__mailerClient')
  const compiled = await build({
    stdin: { contents: source, sourcefile: sourceFile, resolveDir: dirname(sourceFile), loader: 'ts' },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
  })
  compiledHandler = Buffer.from(compiled.outputFiles[0].text).toString('base64')
}, 30000)

type Call = { table: string; op: string; payload?: unknown; filters: Array<[string, unknown, unknown]> }

// Minimal stand-in for the supabase-js query builder: every chain is recorded
// and resolved by the scenario's `respond` function when awaited.
function fakeClient(respond: (call: Call) => { data?: unknown; error?: unknown; count?: number }) {
  const calls: Call[] = []
  const from = (table: string) => {
    const call: Call = { table, op: 'select', filters: [] }
    const builder: Record<string, unknown> = {}
    const chain = (name: string) => (...args: unknown[]) => {
      if (name === 'select' && call.op === 'select') call.payload = args[0]
      if (['update', 'insert', 'upsert', 'delete'].includes(name)) { call.op = name; call.payload = args[0] }
      if (['eq', 'in', 'lt', 'lte', 'gte', 'not', 'order', 'limit'].includes(name)) call.filters.push([name, args[0], args[1]])
      return builder
    }
    for (const name of ['select', 'update', 'insert', 'upsert', 'delete', 'eq', 'in', 'lt', 'lte', 'gte', 'not', 'order', 'limit']) builder[name] = chain(name)
    builder.maybeSingle = () => builder
    builder.then = (resolveFn: (value: unknown) => unknown, rejectFn: (reason: unknown) => unknown) => {
      calls.push(call)
      return Promise.resolve(respond(call)).then(resolveFn, rejectFn)
    }
    return builder
  }
  return { calls, client: { from, auth: { getUser: vi.fn(async () => ({ data: { user: null }, error: new Error('no user') })) } } }
}

const queueRows = [
  { id: 'q1', notification_id: 'n1', user_id: 'buyer', type: 'new_offer', attempts: 0 },
  { id: 'q2', notification_id: 'n2', user_id: 'buyer', type: 'project_closed', attempts: 0 },
  { id: 'q3', notification_id: 'n3', user_id: 'agency', type: 'new_message', attempts: 0 },
]
const notifications = [
  { id: 'n1', user_id: 'buyer', type: 'new_offer', title: 'Du har fått en ny offert', message: 'Ny offert på "Webb".', link: '/dashboard/buyer/uppdrag/p1', is_read: false, created_at: '2026-10-31T10:00:00Z' },
  { id: 'n2', user_id: 'buyer', type: 'project_closed', title: 'Ditt uppdrag har fått max antal offerter', message: null, link: '/dashboard/buyer/uppdrag/p1', is_read: false, created_at: '2026-10-31T10:00:01Z' },
  { id: 'n3', user_id: 'agency', type: 'new_message', title: 'Nytt meddelande från Anna', message: 'Hej', link: '/dashboard/supplier/chatt?project=p1&user=buyer', is_read: true, created_at: '2026-10-31T10:00:02Z' },
]

function scenario(gatewayOk = true) {
  const { calls, client } = fakeClient(call => {
    if (call.table === 'notification_email_queue' && call.op === 'select') return { data: queueRows, error: null }
    if (call.table === 'notification_email_queue' && call.op === 'update' && (call.payload as { status?: string }).status === 'sending') {
      const ids = call.filters.find(([name]) => name === 'in')?.[2] as string[]
      return { data: ids.map(id => ({ id })), error: null }
    }
    if (call.table === 'notifications') return { data: notifications, error: null }
    if (call.table === 'profiles') return { data: [
      { id: 'buyer', email: 'anna@example.test', full_name: 'Anna Svensson', role: 'buyer' },
      { id: 'agency', email: 'owner@example.test', full_name: 'Bo', role: 'supplier' },
    ], error: null }
    if (call.table === 'supplier_profiles') return { data: [{ id: 'agency', contact_email: 'sales@agency.test', contact_name: 'Bo' }], error: null }
    return { data: null, error: null }
  })
  vi.stubGlobal('__mailerClient', client)
  vi.stubGlobal('fetch', vi.fn(async () => gatewayOk
    ? new Response('{"id":"mail"}', { status: 200 })
    : new Response('rate limited', { status: 429 })))
  return calls
}

async function loadHandler() {
  let handler: (request: Request) => Promise<Response>
  vi.stubGlobal('Deno', {
    serve: (callback: typeof handler) => { handler = callback },
    env: { get: (key: string) => ({
      SUPABASE_URL: 'https://local.invalid', SUPABASE_SERVICE_ROLE_KEY: 'service',
      LEAD_ALERT_CRON_SECRET: 'cron-secret', LOVABLE_API_KEY: 'lovable', RESEND_API_KEY: 'resend',
    })[key] },
  })
  await import(/* @vite-ignore */ `data:text/javascript;base64,${compiledHandler}#${Math.random()}`)
  return (headers: Record<string, string> = { 'x-cron-secret': 'cron-secret' }) =>
    handler(new Request('https://local.invalid/send-notification-emails', { method: 'POST', headers }))
}

const statusUpdates = (calls: Call[]) => calls
  .filter(call => call.table === 'notification_email_queue' && call.op === 'update')
  .map(call => ({ status: (call.payload as { status: string }).status, error: (call.payload as { last_error?: string }).last_error, ids: call.filters.find(([name]) => name === 'in')?.[2] }))

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('refuses callers without a cron secret or admin session', async () => {
  scenario()
  const run = await loadHandler()
  expect((await run({})).status).toBe(401)
  expect(fetch).not.toHaveBeenCalled()
})

it('sends one digest per person and skips chat notices already read in the app', async () => {
  const calls = scenario()
  const run = await loadHandler()
  const response = await run()
  expect(await response.json()).toMatchObject({ ok: true, processed: 3, sent: 2, skipped: 1, failed: 0 })

  expect(fetch).toHaveBeenCalledTimes(1)
  const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string)
  expect(body.to).toEqual(['anna@example.test'])
  expect(body.subject).toBe('Du har två nya händelser på Updro')
  expect(body.text).toContain('https://updro.se/dashboard/buyer/uppdrag/p1')

  const updates = statusUpdates(calls)
  expect(updates).toContainEqual({ status: 'skipped', error: 'read_in_app', ids: ['q3'] })
  expect(updates).toContainEqual(expect.objectContaining({ status: 'sent', ids: ['q1', 'q2'] }))
})

it('puts rows back in the queue when the e-mail gateway fails', async () => {
  const calls = scenario(false)
  const run = await loadHandler()
  expect(await (await run()).json()).toMatchObject({ sent: 0, failed: 2 })
  const retried = statusUpdates(calls).filter(update => update.status === 'pending' && update.error?.startsWith('gateway_429'))
  expect(retried.map(update => update.ids)).toEqual([['q1'], ['q2']])
})
