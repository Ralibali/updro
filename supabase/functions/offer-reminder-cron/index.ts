import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { hasCronSecret } from "../_shared/auth.ts";

/**
 * offer-reminder-cron – daglig körning av två notiser som skapas i databasen:
 *   - send_offer_decision_reminders: påminner inloggade beställare om offerter
 *     som väntat minst fem dagar, högst var tredje dag och högst tre gånger per
 *     uppdrag. Gäller även uppdrag som stängts för att alla platser fyllts.
 *   - notify_expiring_offer_slots: varnar byråer 48 timmar innan deras
 *     reserverade offertplats går ut.
 * Notiserna mejlas via send-notification-emails.
 *
 * Anropas av cron en gång per dygn med x-cron-secret (CRON_SECRET eller
 * LEAD_ALERT_CRON_SECRET).
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const FUNCTION_NAME = "offer-reminder-cron";

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
    // Each job runs on its own, so a failure in one does not stop the other.
    const [reminders, warnings] = await Promise.all([
      supabase.rpc("send_offer_decision_reminders"),
      supabase.rpc("notify_expiring_offer_slots"),
    ]);
    const meta = {
      buyerReminders: typeof reminders.data === "number" ? reminders.data : null,
      slotWarnings: typeof warnings.data === "number" ? warnings.data : null,
    };
    const errors = [reminders.error && `reminders: ${reminders.error.message}`, warnings.error && `slots: ${warnings.error.message}`]
      .filter(Boolean).join("; ");
    if (errors) {
      console.error("offer-reminder-cron failed", errors);
      await log(500, meta, errors.slice(0, 400));
      return json({ error: "Reminder job failed", ...meta }, 500);
    }
    await log(200, meta);
    return json({ success: true, ...meta });
  } catch (error) {
    console.error("offer-reminder-cron failed", error);
    await log(500, {}, error instanceof Error ? error.message.slice(0, 400) : "unknown_error");
    return json({ error: "Reminder job failed" }, 500);
  }
});
