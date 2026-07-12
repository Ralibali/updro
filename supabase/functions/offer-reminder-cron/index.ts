import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

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
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

    // Guest buyers are handled by send-guest-offer-emails. This job only creates
    // in-app reminders for authenticated buyers.
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select("id, title, buyer_id, offer_count")
      .eq("status", "active")
      .not("buyer_id", "is", null)
      .gt("offer_count", 0)
      .lt("created_at", fiveDaysAgo);

    if (projectError) throw projectError;

    let notificationsSent = 0;
    let skipped = 0;

    for (const project of projects || []) {
      if (!project.buyer_id) {
        skipped++;
        continue;
      }

      const { data: pendingOffers, error: offerError } = await supabase
        .from("offers")
        .select("id, created_at")
        .eq("project_id", project.id)
        .eq("status", "pending");
      if (offerError) throw offerError;
      if (!pendingOffers?.length) {
        skipped++;
        continue;
      }

      const oldestOffer = pendingOffers.reduce((oldest, offer) =>
        new Date(offer.created_at) < new Date(oldest.created_at) ? offer : oldest
      );
      if (new Date(oldestOffer.created_at).getTime() > Date.now() - 5 * 24 * 60 * 60 * 1000) {
        skipped++;
        continue;
      }

      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const { data: existingNotification, error: notificationLookupError } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", project.buyer_id)
        .eq("type", "offer_reminder")
        .gte("created_at", threeDaysAgo)
        .limit(1);
      if (notificationLookupError) throw notificationLookupError;
      if (existingNotification?.length) {
        skipped++;
        continue;
      }

      const { error: insertError } = await supabase.from("notifications").insert({
        user_id: project.buyer_id,
        type: "offer_reminder",
        title: "Dina offerter väntar på svar",
        message: `Du har ${pendingOffers.length} intresserade ${pendingOffers.length === 1 ? "byrå" : "byråer"} på "${project.title}" som väntar på ditt beslut.`,
        link: `/dashboard/buyer/uppdrag/${project.id}`,
      });
      if (insertError) throw insertError;

      notificationsSent++;
    }

    return json({ success: true, notificationsSent, skipped, checked: projects?.length || 0 });
  } catch (error) {
    console.error("offer-reminder-cron failed", error);
    return json({ error: "Reminder job failed" }, 500);
  }
});
