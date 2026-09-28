import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.98.0';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info' };
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: 'Logga in igen.' }, 401);
  const { data: isAdmin, error: roleError } = await userClient.rpc('is_admin', { _user_id: user.id });
  if (roleError || !isAdmin) return json({ error: 'Administratör krävs.' }, 403);
  const key = Deno.env.get('PERPLEXITY_API_KEY');
  if (!key || Deno.env.get('AI_VISIBILITY_ENABLED') !== 'true') return json({ error: 'Automatisk mätning är inte aktiverad.' }, 503);
  let input;
  try { input = await req.json(); } catch { return json({ error: 'Ogiltig begäran.' }, 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ error: 'Ogiltig begäran.' }, 400);
  const { data: project } = await userClient.from('ai_visibility_workspaces').select('*').eq('id', input.workspaceId).maybeSingle();
  const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
  if (!project || !prompt || prompt.length > 500 || !(String(project.workspace.questions).split('\n').map((s: string) => s.trim()).slice(0, 30)).includes(prompt)) return json({ error: 'Spara arbetsytan och välj en av de första 30 frågorna.' }, 400);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  // Reserve before spending. One attempt per question/day, also across concurrent requests.
  const { data: check, error: reserveError } = await admin.from('ai_visibility_checks').insert({ workspace_id: project.id, prompt }).select('id').single();
  if (reserveError) return json({ error: reserveError.code === '23505' ? 'Frågan har redan körts eller påbörjats idag.' : 'Kunde inte reservera mätningen.' }, reserveError.code === '23505' ? 409 : 500);
  try {
    const response = await fetch('https://api.perplexity.ai/v1/sonar', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({ model: 'sonar', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!response.ok) throw new Error('Provider failed');
    const body = await response.json();
    const answer = body.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) throw new Error('Empty answer');
    const result = { answer: answer.slice(0, 20000), citations: (Array.isArray(body.citations) ? body.citations : []).filter((s: unknown) => typeof s === 'string' && s.startsWith('https://')).slice(0, 30), model: String(body.model ?? 'sonar'), checkedAt: new Date().toISOString() };
    const { error } = await admin.from('ai_visibility_checks').update({ status: 'complete', result }).eq('id', check.id);
    if (error) throw error;
    return json(result);
  } catch {
    await admin.from('ai_visibility_checks').update({ status: 'failed' }).eq('id', check.id);
    return json({ error: 'Mätningen misslyckades. Inget nollresultat har registrerats. Försök nästa dag.' }, 502);
  }
});
