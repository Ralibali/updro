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

const safeOrigin = (rawOrigin: string | null) => {
  if (!rawOrigin) return "https://updro.se";
  if (rawOrigin === "https://updro.se" || rawOrigin === "https://www.updro.se") return rawOrigin;
  if (/^http:\/\/localhost:\d+$/.test(rawOrigin)) return rawOrigin;
  if (/^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(rawOrigin)) return rawOrigin;
  return "https://updro.se";
};

serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metoden stöds inte." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

  if (!supabaseUrl || !anonKey || !serviceKey || !stripeKey) {
    return json({ error: "Betalningen är inte korrekt konfigurerad." }, 500);
  }

  const plans = {
    monthly: {
      priceId: Deno.env.get("STRIPE_MONTHLY_PRICE_ID") || "price_1TOcX1HzffTezY8204n36Q31",
      mode: "subscription" as const,
    },
    yearly: {
      priceId: Deno.env.get("STRIPE_YEARLY_PRICE_ID") || "price_1TsUYSHzffTezY82ZFIUm1zg",
      mode: "subscription" as const,
    },
    lead: {
      priceId: Deno.env.get("STRIPE_LEAD_PRICE_ID") || "price_1TOcX2HzffTezY82yzbAX5ZD",
      mode: "payment" as const,
    },
  };


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
    const planId = body?.planId as keyof typeof plans;
    const selected = plans[planId];
    if (!selected) return json({ error: "Ogiltig betalningsprodukt." }, 400);

    const { data: supplier, error: supplierError } = await admin
      .from("supplier_profiles")
      .select("id, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    if (supplierError) throw supplierError;
    if (!supplier) return json({ error: "Endast registrerade byråer kan köpa leads." }, 403);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    let customerId = supplier.stripe_customer_id as string | null;

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data[0]) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.user_metadata?.full_name || undefined,
          metadata: { user_id: user.id },
        });
        customerId = customer.id;
      }

      const { error: customerSaveError } = await admin
        .from("supplier_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      if (customerSaveError) throw customerSaveError;
    }

    const metadata = { user_id: user.id, purchase_type: planId };
    const origin = safeOrigin(req.headers.get("origin"));
    const billingReturnUrl = `${origin}/dashboard/supplier/fakturering`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: selected.priceId, quantity: 1 }],
      mode: selected.mode,
      success_url: `${billingReturnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${billingReturnUrl}?canceled=true`,
      metadata,
      subscription_data: selected.mode === "subscription" ? { metadata } : undefined,
      payment_intent_data: selected.mode === "payment" ? { metadata } : undefined,
      allow_promotion_codes: selected.mode === "subscription",
    });

    if (!session.url) throw new Error("Stripe returnerade ingen betallänk.");
    return json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[CREATE-CHECKOUT] Error:", message);
    return json({ error: "Kunde inte starta betalningen. Försök igen." }, 500);
  }
});
