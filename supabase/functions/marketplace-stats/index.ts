import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

/**
 * marketplace-stats – publika, aggregerade räknare för startsidan.
 * Returnerar ALDRIG rådata eller personuppgifter, bara tre totalsiffror.
 * Anropas anonymt från webben; service role används bara för count-frågor.
 * Siffrorna cachas 5 minuter (Cache-Control + stale-while-revalidate).
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Stats are not configured" }, 500);

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const head = { count: "exact", head: true } as const;
    const [projects, offers, agencies] = await Promise.all([
      supabase
        .from("projects")
        .select("id", head)
        .in("status", ["active", "closed", "completed"]),
      supabase
        .from("offers")
        .select("id", head)
        .neq("status", "withdrawn"),
      supabase
        .from("supplier_profiles")
        .select("id", head),
    ]);

    if (projects.error || offers.error || agencies.error) {
      return json({ error: "Could not compute stats" }, 500);
    }

    return json({
      projects: projects.count ?? 0,
      offers: offers.count ?? 0,
      agencies: agencies.count ?? 0,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
