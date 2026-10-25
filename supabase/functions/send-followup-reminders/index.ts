import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.0'
import { bearerToken, constantTimeEqual } from '../_shared/auth.ts'

/**
 * send-followup-reminders – skapar en intern notis i byråns översikt när en
 * planerad säljuppföljning har förfallit. Skickar INGA mejl eller SMS; notisen
 * syns bara inne på Updro för byrån själv.
 *
 * Anropas av cron en gång per dygn med headern x-cron-secret: <CRON_SECRET>,
 * eller manuellt av en inloggad admin. Idempotent: dedup-nyckeln
 * followup:<offer_id>:<datum> gör att samma påminnelse aldrig skapas två gånger.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

const FUNCTION_NAME = 'send-followup-reminders'
const BATCH_SIZE = 200

const createAdminClient = (url: string, serviceKey: string) =>
  createClient(url, serviceKey, { auth: { persistSession: false } })

type AdminClient = ReturnType<typeof createAdminClient>

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

async function logCall(admin: AdminClient, entry: { status: number; duration_ms: number; error?: string | null; meta?: Record<string, unknown> }) {
  try {
    await admin.from('edge_function_logs').insert({
      function_name: FUNCTION_NAME,
      status_code: entry.status,
      duration_ms: entry.duration_ms,
      ok: entry.status >= 200 && entry.status < 400,
      error: entry.error || null,
      meta: entry.meta || {},
    })
  } catch (error) {
    console.error('log insert failed', error)
  }
}

async function isAuthorized(request: Request, admin: AdminClient): Promise<boolean> {
  const cronSecret = Deno.env.get('CRON_SECRET') || ''
  const header = request.headers.get('x-cron-secret') || ''
  if (constantTimeEqual(header, cronSecret)) return true

  const token = bearerToken(request.headers.get('Authorization'))
  if (!token) return false
  if (constantTimeEqual(token, cronSecret)) return true

  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user) return false
  const { data: profile } = await admin.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
  return (profile as { role?: string } | null)?.role === 'admin'
}

const buildDedupKey = (offerId: string, day: string) => `followup:${offerId}:${day}`

Deno.serve(async (request) => {
  const startedAt = Date.now()
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!supabaseUrl || !serviceKey) return json({ error: 'Server configuration missing' }, 500)

  const admin = createAdminClient(supabaseUrl, serviceKey)

  if (!(await isAuthorized(request, admin))) {
    await logCall(admin, { status: 401, duration_ms: Date.now() - startedAt, error: 'unauthorized' })
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)

    // Due follow-ups on offers that are still actionable (pending/accepted).
    const { data: dueRows, error: dueError } = await admin
      .from('supplier_offer_followups')
      .select('offer_id, supplier_id, next_action, follow_up_at, offers!inner(id, title, status, project_id)')
      .not('follow_up_at', 'is', null)
      .lte('follow_up_at', now.toISOString())
      .in('offers.status', ['pending', 'accepted'])
      .limit(BATCH_SIZE)

    if (dueError) throw dueError

    const rows = (dueRows || []) as unknown as Array<{
      offer_id: string
      supplier_id: string
      next_action: string | null
      follow_up_at: string
      offers: { id: string; title: string | null; status: string | null; project_id: string | null }
    }>

    if (rows.length === 0) {
      await logCall(admin, { status: 200, duration_ms: Date.now() - startedAt, meta: { due: 0, inserted: 0 } })
      return json({ ok: true, due: 0, inserted: 0 })
    }

    const notifications = rows.map(row => ({
      supplier_id: row.supplier_id,
      project_id: row.offers.project_id,
      type: 'offer_followup_due',
      title: `Dags att följa upp: ${(row.offers.title || 'din offert').slice(0, 80)}`,
      body: row.next_action
        ? `Du planerade: ${row.next_action.slice(0, 200)}`
        : 'Du har en planerad återkontakt som har passerat. Öppna offerten och bestäm nästa steg.',
      dedup_key: buildDedupKey(row.offer_id, today),
    }))

    // ignoreDuplicates on the unique dedup_key makes reruns safe.
    const { data: inserted, error: insertError } = await admin
      .from('supplier_notifications')
      .upsert(notifications, { onConflict: 'dedup_key', ignoreDuplicates: true })
      .select('id')

    if (insertError) throw insertError

    const insertedCount = inserted?.length ?? 0
    await logCall(admin, { status: 200, duration_ms: Date.now() - startedAt, meta: { due: rows.length, inserted: insertedCount } })
    return json({ ok: true, due: rows.length, inserted: insertedCount })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown'
    console.error('send-followup-reminders failed', error)
    await logCall(admin, { status: 500, duration_ms: Date.now() - startedAt, error: message })
    return json({ error: 'Internal error' }, 500)
  }
})
