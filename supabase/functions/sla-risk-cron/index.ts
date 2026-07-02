import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const cutoff = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("status", "active")
    .eq("offer_count", 0)
    .lt("created_at", cutoff);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const ids = (data || []).map((project) => project.id);
  if (ids.length > 0) await supabase.from("projects").update({ sla_at_risk: true }).in("id", ids);
  await supabase.from("projects").update({ sla_at_risk: false }).eq("sla_at_risk", true).gt("offer_count", 0);

  return new Response(JSON.stringify({ success: true, flagged: ids.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
