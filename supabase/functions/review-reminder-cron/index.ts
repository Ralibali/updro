import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

/**
 * review-reminder-cron – ber beställare om omdöme fem dagar efter att de
 * accepterat en offert. Hoppar över uppdrag som redan har omdöme och
 * beställare som påmintts den senaste veckan. Körs via scheduler med
 * samma CRON_SECRET-mönster som offer-reminder-cron.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const REMINDER_AFTER_DAYS = 5;
const REMINDER_COOLDOWN_DAYS = 7;

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expected = Deno.env.get("CRON_SECRET");
  const provided =
    req.headers.get("x-cron-secret") ||
    (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!expected || provided !== expected) return json({ error: "Unauthorized" }, 401);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Cron is not configured" }, 500);

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const cutoff = new Date(Date.now() - REMINDER_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: acceptedOffers, error: offersError } = await supabase
      .from("offers")
      .select("id, project_id, supplier_id, updated_at, projects(id, title, buyer_id), profiles!offers_supplier_id_fkey(company_name, full_name)")
      .eq("status", "accepted")
      .lt("updated_at", cutoff)
      .limit(100);
    if (offersError) throw offersError;

    let remindersSent = 0;
    let skipped = 0;

    for (const offer of acceptedOffers || []) {
      const project = Array.isArray(offer.projects) ? offer.projects[0] : offer.projects;
      if (!project?.buyer_id) {
        skipped++;
        continue;
      }

      // Finns redan ett omdöme för uppdraget?
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .select("id")
        .eq("project_id", project.id)
        .eq("buyer_id", project.buyer_id)
        .limit(1);
      if (reviewError) throw reviewError;
      if (review?.length) {
        skipped++;
        continue;
      }

      // Påmind nyligen?
      const cooldown = new Date(Date.now() - REMINDER_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const { data: existing, error: lookupError } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", project.buyer_id)
        .eq("type", "review_reminder")
        .gte("created_at", cooldown)
        .limit(1);
      if (lookupError) throw lookupError;
      if (existing?.length) {
        skipped++;
        continue;
      }

      const supplierProfile = Array.isArray(offer.profiles) ? offer.profiles[0] : offer.profiles;
      const supplierName = supplierProfile?.company_name || supplierProfile?.full_name || "byrån";

      const { error: insertError } = await supabase.from("notifications").insert({
        user_id: project.buyer_id,
        type: "review_reminder",
        title: "Hur blev samarbetet?",
        message: `Berätta hur det gick med ${supplierName} på "${project.title}" – ditt omdöme hjälper andra beställare att välja rätt.`,
        link: `/dashboard/buyer/uppdrag/${project.id}`,
      });
      if (insertError) throw insertError;

      remindersSent++;
    }

    return json({ success: true, remindersSent, skipped, checked: acceptedOffers?.length || 0 });
  } catch (error) {
    console.error("review-reminder-cron failed", error);
    return json({ error: "Reminder job failed" }, 500);
  }
});
