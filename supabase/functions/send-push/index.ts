// @ts-nocheck – Deno/npm-typer finns inte i frontendens tsconfig
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import webpush from "npm:web-push@3.6.7";

/**
 * send-push – skickar web push när en notis skapas.
 * Triggas av en database webhook på INSERT i public.notifications
 * (payload: { type: "INSERT", record: {...} }) eller anropas direkt
 * med { notification: {...} }.
 *
 * Hemligheter som krävs:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...)
 * Valfri: PUSH_WEBHOOK_SECRET – om satt måste headern x-webhook-secret matcha.
 * Döda prenumerationer (404/410) städas bort automatiskt.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const webhookSecret = Deno.env.get("PUSH_WEBHOOK_SECRET");
  if (webhookSecret && req.headers.get("x-webhook-secret") !== webhookSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:info@updro.se";
    if (!vapidPublic || !vapidPrivate) return json({ error: "VAPID keys are not configured" }, 500);

    const payload = await req.json().catch(() => ({}));
    const notification = payload?.record || payload?.notification;
    if (!notification?.user_id || !notification?.title) {
      return json({ error: "Invalid notification payload" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { data: subs, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", notification.user_id);
    if (subsError) throw subsError;
    if (!subs?.length) return json({ success: true, sent: 0 });

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const body = JSON.stringify({
      title: notification.title,
      body: notification.message || "",
      link: notification.link || "/",
      icon: "/icons/icon-192.png",
    });

    let sent = 0;
    const staleIds: string[] = [];

    await Promise.all(
      subs.map(async sub => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            body,
          );
          sent++;
        } catch (error) {
          const status = (error as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) staleIds.push(sub.id);
          else console.error("push failed", sub.endpoint, error);
        }
      }),
    );

    if (staleIds.length) {
      await supabase.from("push_subscriptions").delete().in("id", staleIds);
    }

    return json({ success: true, sent, pruned: staleIds.length });
  } catch (error) {
    console.error("send-push failed", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
