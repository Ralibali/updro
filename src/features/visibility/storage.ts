import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
// Migration-owned tables; do not edit the generated Lovable schema file.
const db = supabase as SupabaseClient;
export type SavedWorkspace = { id: string; name: string; workspace: unknown; revision: number };
export async function listWorkspaces(): Promise<SavedWorkspace[]> {
  const { data, error } = await db.from('ai_visibility_workspaces').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error('Arbetsytorna kunde inte hämtas. Kontrollera att migrationen är driftsatt.');
  return data ?? [];
}
export async function saveWorkspace(id: string | null, revision: number, name: string, workspace: unknown): Promise<SavedWorkspace> {
  const query = id
    ? db.from('ai_visibility_workspaces').update({ name, workspace, revision: revision + 1, updated_at: new Date().toISOString() }).eq('id', id).eq('revision', revision)
    : db.from('ai_visibility_workspaces').insert({ name, workspace });
  const { data, error } = await query.select('*').maybeSingle();
  if (error) throw new Error('Kunde inte spara arbetsytan. Dina ändringar finns kvar här.');
  if (!data) throw new Error('Arbetsytan har ändrats av någon annan. Exportera dina ändringar innan du laddar om.');
  return data;
}
export type Measurement = { id: string; prompt: string; status: string; created_at: string; result: { answer: string; citations: string[]; model: string; checkedAt: string } | null };
export async function listMeasurements(id: string): Promise<Measurement[]> {
  const { data, error } = await db.from('ai_visibility_checks').select('*').eq('workspace_id', id).order('created_at', { ascending: false }).limit(100);
  if (error) throw new Error('Mäthistoriken kunde inte hämtas.');
  return data ?? [];
}
