import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { BillingConfigError, getBillingPlan } from "../_shared/billing-plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metoden stöds inte." }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!stripeKey || !supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Abonnemangshanteringen är inte korrekt konfigurerad." }, 500);
  }

  let monthlyPriceId: string;
  let yearlyPriceId: string;
  try {
    monthlyPriceId = getBillingPlan("monthly").priceId;
    yearlyPriceId = getBillingPlan("yearly").priceId;
  } catch (error) {
    if (error instanceof BillingConfigError) {
      console.error("[MANAGE-SUB] Billing config error:", error.message);
      return json({ error: "Abonnemangshanteringen är inte korrekt konfigurerad." }, 500);
    }
    throw error;
  }


  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Du måste vara inloggad." }, 401);

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData.user?.email) return json({ error: "Du måste vara inloggad." }, 401);

    const user = userData.user;
    const body = await req.json().catch(() => ({}));
    const action = body?.action as "switch" | "cancel" | "resume" | "preview";
    const target = body?.target as "monthly" | "yearly" | undefined;

    if (!action || !["switch", "cancel", "resume", "preview"].includes(action)) {
      return json({ error: "Ogiltig åtgärd." }, 400);
    }
    if ((action === "switch" || action === "preview") && !["monthly", "yearly"].includes(target || "")) {
      return json({ error: "Ogiltigt målabonnemang." }, 400);
    }

    const { data: supplier, error: supplierError } = await admin
      .from("supplier_profiles")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("id", user.id)
      .maybeSingle();
    if (supplierError) throw supplierError;
    if (!supplier?.stripe_customer_id) return json({ error: "Inget kundkonto hittades." }, 404);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const subs = await stripe.subscriptions.list({
      customer: supplier.stripe_customer_id,
      status: "all",
      limit: 20,
    });
    const active = subs.data.find(s =>
      (s.status === "active" || s.status === "trialing") &&
      s.items.data.some(i => i.price.id === monthlyPriceId || i.price.id === yearlyPriceId)
    );
    if (!active) return json({ error: "Inget aktivt abonnemang hittades." }, 404);

    const snapshot = (sub: any) => {
      const item = sub.items?.data?.find((i: any) => i.price.id === monthlyPriceId || i.price.id === yearlyPriceId) ?? sub.items?.data?.[0];
      const interval = item?.price?.recurring?.interval === "year" ? "year" : "month";
      const periodEnd = item?.current_period_end ?? sub.current_period_end;
      return {
        subscribed: sub.status === "active" || sub.status === "trialing",
        status: sub.status,
        interval,
        cancel_at_period_end: !!sub.cancel_at_period_end,
        subscription_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        current_period_start: item?.current_period_start
          ? new Date(item.current_period_start * 1000).toISOString()
          : (sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null),
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      };
    };

    if (action === "cancel") {
      const updated = await stripe.subscriptions.update(active.id, { cancel_at_period_end: true });
      return json({ ok: true, message: "Abonnemanget avslutas vid periodens slut.", subscription: snapshot(updated) });
    }

    if (action === "resume") {
      const updated = await stripe.subscriptions.update(active.id, { cancel_at_period_end: false });
      return json({ ok: true, message: "Abonnemanget är återaktiverat.", subscription: snapshot(updated) });
    }

    // switch / preview
    const newPriceId = target === "yearly" ? yearlyPriceId : monthlyPriceId;
    const currentItem = active.items.data.find(i => i.price.id === monthlyPriceId || i.price.id === yearlyPriceId);
    if (!currentItem) return json({ error: "Kunde inte hitta prenumerationsraden." }, 500);
    if (currentItem.price.id === newPriceId) {
      return json({ ok: true, message: "Du har redan det abonnemanget." });
    }

    if (action === "preview") {
      const prorationDate = Math.floor(Date.now() / 1000);
      let preview: any = null;
      try {
        // Newer API
        preview = await (stripe.invoices as any).createPreview({
          customer: supplier.stripe_customer_id,
          subscription: active.id,
          subscription_details: {
            items: [{ id: currentItem.id, price: newPriceId }],
            proration_behavior: "create_prorations",
            proration_date: prorationDate,
          },
        });
      } catch (_e) {
        preview = await (stripe.invoices as any).retrieveUpcoming({
          customer: supplier.stripe_customer_id,
          subscription: active.id,
          subscription_items: [{ id: currentItem.id, price: newPriceId }],
          subscription_proration_behavior: "create_prorations",
          subscription_proration_date: prorationDate,
        });
      }

      const prorationLines = (preview.lines?.data || []).filter((l: any) => l.proration);
      const prorationAmount = prorationLines.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
      const newPrice = await stripe.prices.retrieve(newPriceId);

      return json({
        ok: true,
        preview: {
          currency: (preview.currency || "sek").toUpperCase(),
          amount_due: preview.amount_due ?? 0,
          subtotal: preview.subtotal ?? 0,
          total: preview.total ?? 0,
          proration_amount: prorationAmount,
          next_payment_attempt: preview.next_payment_attempt
            ? new Date(preview.next_payment_attempt * 1000).toISOString()
            : (preview.period_end ? new Date(preview.period_end * 1000).toISOString() : null),
          period_end: preview.period_end ? new Date(preview.period_end * 1000).toISOString() : null,
          current_price: {
            amount: currentItem.price.unit_amount ?? 0,
            interval: currentItem.price.recurring?.interval ?? null,
          },
          new_price: {
            amount: newPrice.unit_amount ?? 0,
            interval: newPrice.recurring?.interval ?? null,
          },
          target,
        },
      });
    }

    const updated = await stripe.subscriptions.update(active.id, {
      items: [{ id: currentItem.id, price: newPriceId }],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
    });

    return json({
      ok: true,
      message: target === "yearly"
        ? "Du är nu uppgraderad till årskort. Mellanskillnaden proportioneras på nästa faktura."
        : "Du är nu bytt till månadskort. Ändringen träder i kraft direkt.",
      subscription: snapshot(updated),
    });
  } catch (error) {
    console.error("[MANAGE-SUB] Error:", error);
    const message = error instanceof Error ? error.message : "Okänt fel";
    return json({ error: `Kunde inte uppdatera abonnemanget: ${message}` }, 500);
  }
});
