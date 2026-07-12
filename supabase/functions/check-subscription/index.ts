import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

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
  const monthlyPriceId = Deno.env.get("STRIPE_MONTHLY_PRICE_ID") || "price_1TOcX1HzffTezY8204n36Q31";
  const yearlyPriceId = Deno.env.get("STRIPE_YEARLY_PRICE_ID") || "price_1TsUYSHzffTezY82ZFIUm1zg";
  const subscriptionPriceIds = new Set([monthlyPriceId, yearlyPriceId]);


  if (!stripeKey || !supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Abonnemangskontrollen är inte korrekt konfigurerad." }, 500);
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
    const { data: supplier, error: supplierError } = await admin
      .from("supplier_profiles")
      .select("stripe_customer_id, stripe_subscription_id, plan, lead_credits")
      .eq("id", user.id)
      .maybeSingle();
    if (supplierError) throw supplierError;
    if (!supplier) return json({ error: "Byråprofilen kunde inte hittas." }, 404);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    let customerId = supplier.stripe_customer_id as string | null;

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0]?.id || null;
      if (customerId) {
        const { error } = await admin.from("supplier_profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
        if (error) throw error;
      }
    }

    if (!customerId) {
      if (supplier.plan === "monthly") {
        await admin.from("supplier_profiles").update({
          plan: "payg",
          stripe_subscription_id: null,
          lead_credits: (supplier.lead_credits || 0) > 100 ? 0 : (supplier.lead_credits || 0),
        }).eq("id", user.id);
      }
      return json({ subscribed: false, plan: "payg", subscription_end: null });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 20,
    });

    const activeSubscription = subscriptions.data.find(subscription =>
      (subscription.status === "active" || subscription.status === "trialing") &&
      subscription.items.data.some(item => subscriptionPriceIds.has(item.price.id))
    );


    if (!activeSubscription) {
      if (supplier.plan === "monthly" || supplier.stripe_subscription_id) {
        const { error } = await admin.from("supplier_profiles").update({
          plan: "payg",
          stripe_subscription_id: null,
          lead_credits: (supplier.lead_credits || 0) > 100 ? 0 : (supplier.lead_credits || 0),
        }).eq("id", user.id);
        if (error) throw error;
      }
      return json({ subscribed: false, plan: "payg", subscription_end: null });
    }

    const { error: updateError } = await admin.from("supplier_profiles").update({
      plan: "monthly",
      stripe_customer_id: customerId,
      stripe_subscription_id: activeSubscription.id,
    }).eq("id", user.id);
    if (updateError) throw updateError;

    const activeItem = activeSubscription.items.data.find(i => subscriptionPriceIds.has(i.price.id));
    const interval: "month" | "year" = activeItem?.price.id === yearlyPriceId ? "year" : "month";

    return json({
      subscribed: true,
      plan: "monthly",
      interval,
      cancel_at_period_end: activeSubscription.cancel_at_period_end,
      subscription_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
    });

  } catch (error) {
    console.error("[CHECK-SUB] Error:", error);
    return json({ error: "Kunde inte kontrollera abonnemanget." }, 500);
  }
});
