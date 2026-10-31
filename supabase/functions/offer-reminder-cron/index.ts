import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { hasCronSecret } from "../_shared/auth.ts";
import { swedishCount } from "../_shared/notification-email.ts";

/**
 * offer-reminder-cron – påminner inloggade beställare om offerter som väntat
 * i minst fem dagar. Gäller även uppdrag som stängts för att alla platser
 * fyllts, eftersom det är där beslutet återstår. Notisen mejlas också via
 * send-notification-emails.
 *
 * Anropas av cron en gång per dygn med x-cron-secret (CRON_SECRET eller
 * LEAD_ALERT_CRON_SECRET).
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const FUNCTION_NAME = "offer-reminder-cron";
const DAY_MS = 24 * 60 * 60 * 1000;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!hasCronSecret(req.headers, [Deno.env.get("CRON_SECRET"), Deno.env.get("LEAD_ALERT_CRON_SECRET")])) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Cron is not configured" }, 500);
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const started = Date.now();

  const log = async (status: number, meta: Record<string, unknown>, error: string | null = null) => {
    try {
      await supabase.from("edge_function_logs").insert({
        function_name: FUNCTION_NAME, status_code: status, duration_ms: Date.now() - started,
        ok: status < 400, error, meta,
      });
    } catch (logError) {
      console.error("log insert failed", logError);
    }
  };

  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * DAY_MS).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * DAY_MS).toISOString();

    // Guest buyers are mailed by send-guest-offer-emails. This job covers
    // registered buyers, also when every slot is filled and the project closed.
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select("id, title, buyer_id")
      .in("status", ["active", "closed"])
      .not("buyer_id", "is", null)
      .gt("offer_count", 0)
      .lt("created_at", fiveDaysAgo)
      .limit(500);
    if (projectError) throw projectError;

    let notificationsSent = 0;
    let skipped = 0;

    for (const project of projects || []) {
      const { data: offers, error: offerError } = await supabase
        .from("offers")
        .select("id, status, created_at")
        .eq("project_id", project.id);
      if (offerError) throw offerError;

      const pending = (offers || []).filter(offer => offer.status === "pending");
      const decided = (offers || []).some(offer => offer.status === "accepted");
      const oldestPending = pending.reduce<number>((oldest, offer) => Math.min(oldest, Date.parse(offer.created_at)), Infinity);
      if (decided || !pending.length || oldestPending > Date.now() - 5 * DAY_MS) {
        skipped++;
        continue;
      }

      const link = `/dashboard/buyer/uppdrag/${project.id}`;
      const { data: recent, error: lookupError } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", project.buyer_id)
        .eq("type", "offer_reminder")
        .eq("link", link)
        .gte("created_at", threeDaysAgo)
        .limit(1);
      if (lookupError) throw lookupError;
      if (recent?.length) {
        skipped++;
        continue;
      }

      const agencies = pending.length === 1 ? "en byrå väntar" : `${swedishCount(pending.length)} byråer väntar`;
      const { error: insertError } = await supabase.from("notifications").insert({
        user_id: project.buyer_id,
        type: "offer_reminder",
        title: "Dina offerter väntar på svar",
        message: `På "${project.title}" ${agencies} på ditt besked. Välj en offert eller avböj, så vet byråerna var de står.`,
        link,
      });
      if (insertError) throw insertError;
      notificationsSent++;
    }

    const meta = { notificationsSent, skipped, checked: projects?.length || 0 };
    await log(200, meta);
    return json({ success: true, ...meta });
  } catch (error) {
    console.error("offer-reminder-cron failed", error);
    await log(500, {}, error instanceof Error ? error.message.slice(0, 400) : "unknown_error");
    return json({ error: "Reminder job failed" }, 500);
  }
});
