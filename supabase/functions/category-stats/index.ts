import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

/**
 * category-stats – aggregerade marknadstal per kategori för de publika
 * kategorisidorna: antal uppdrag, offerter och mediantid till första offert.
 * Returnerar aldrig rådata eller personuppgifter. Cachas 10 minuter.
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
      "Cache-Control": "public, max-age=600, stale-while-revalidate=3600",
    },
  });

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Stats are not configured" }, 500);

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, category, created_at, offers(id, created_at, status)")
      .in("status", ["active", "closed", "completed"])
      .limit(5000);
    if (projectsError) throw projectsError;

    const buckets = new Map<string, { projects: number; offers: number; responseHours: number[] }>();

    for (const project of projects || []) {
      const category = project.category || "Övrigt";
      const bucket = buckets.get(category) || { projects: 0, offers: 0, responseHours: [] };
      bucket.projects += 1;

      const realOffers = (project.offers || []).filter((o: { status: string }) => o.status !== "withdrawn");
      bucket.offers += realOffers.length;

      if (realOffers.length > 0) {
        const firstOfferAt = realOffers.reduce((earliest: string, o: { created_at: string }) =>
          o.created_at < earliest ? o.created_at : earliest, realOffers[0].created_at);
        const hours = Math.round(
          (new Date(firstOfferAt).getTime() - new Date(project.created_at).getTime()) / 3_600_000,
        );
        if (hours >= 0) bucket.responseHours.push(hours);
      }

      buckets.set(category, bucket);
    }

    const categories = [...buckets.entries()].map(([category, bucket]) => ({
      category,
      projects: bucket.projects,
      offers: bucket.offers,
      avg_offers_per_project: bucket.projects > 0 ? Math.round((bucket.offers / bucket.projects) * 10) / 10 : 0,
      median_hours_to_first_offer: median(bucket.responseHours),
    }));

    return json({ categories, updated_at: new Date().toISOString() });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
