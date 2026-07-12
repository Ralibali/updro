import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { isBillingPlanId } from "../_shared/billing-plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Metoden stöds inte." }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!stripeKey || !supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Betalningsbekräftelsen är inte korrekt konfigurerad." }, 500);
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return json({ error: "Du måste vara inloggad." }, 401);

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Du måste vara inloggad." }, 401);

    const { sessionId } = await request.json().catch(() => ({}));
    if (typeof sessionId !== "string" || !/^cs_/.test(sessionId)) {
      return json({ error: "Ogiltig betalningsreferens." }, 400);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadataUserId = session.metadata?.user_id || session.client_reference_id;
    if (metadataUserId !== userData.user.id) return json({ error: "Betalningen tillhör ett annat konto." }, 403);
    if (session.status !== "complete" || (session.payment_status !== "paid" && session.payment_status !== "no_payment_required")) {
      return json({ error: "Betalningen är ännu inte slutförd." }, 409);
    }

    const purchaseType = session.metadata?.purchase_type;
    if (!isBillingPlanId(purchaseType)) {
      return json({ error: "Okänd betalningsprodukt." }, 400);
    }


    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
    if (customerId) {
      const { error } = await admin
        .from("supplier_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userData.user.id);
      if (error) throw error;
    }

    const { data: applied, error: applyError } = await admin.rpc("apply_stripe_purchase_event", {
      p_event_id: `checkout_session:${session.id}`,
      p_event_type: "checkout.session.confirmed",
      p_supplier_id: userData.user.id,
      p_purchase_type: purchaseType,
      p_amount_sek: Math.round((session.amount_total || 0) / 100),
      p_subscription_id: typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null,
    });
    if (applyError) throw applyError;

    return json({ success: true, applied: Boolean(applied), purchase_type: purchaseType });
  } catch (error) {
    console.error("confirm-checkout failed", error);
    return json({ error: "Kunde inte bekräfta betalningen." }, 500);
  }
});
