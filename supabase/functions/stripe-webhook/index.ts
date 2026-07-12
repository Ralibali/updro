import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, stripe-signature",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const monthlyPriceId = Deno.env.get("STRIPE_MONTHLY_PRICE_ID") || "price_1TOcX1HzffTezY8204n36Q31";
  const yearlyPriceId = Deno.env.get("STRIPE_YEARLY_PRICE_ID") || "price_1TsUYSHzffTezY82ZFIUm1zg";
  const subscriptionPriceIds = new Set([monthlyPriceId, yearlyPriceId]);


  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    console.error("stripe-webhook missing required secrets");
    return json({ error: "Webhook is not configured" }, 500);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing Stripe signature" }, 400);

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (error) {
    console.error("stripe-webhook signature verification failed", error);
    return json({ error: "Invalid signature" }, 400);
  }

  const resolveSupplierId = async (customerId: string | null, metadataUserId?: string | null) => {
    if (metadataUserId) {
      const { data } = await admin
        .from("supplier_profiles")
        .select("id")
        .eq("id", metadataUserId)
        .maybeSingle();
      if (data?.id) {
        if (customerId) {
          await admin.from("supplier_profiles").update({ stripe_customer_id: customerId }).eq("id", data.id);
        }
        return data.id as string;
      }
    }

    if (customerId) {
      const { data } = await admin
        .from("supplier_profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (data?.id) return data.id as string;
    }

    return null;
  };

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
      const purchaseType = session.metadata?.purchase_type;
      const supplierId = await resolveSupplierId(customerId, session.metadata?.user_id || session.client_reference_id);

      if (!supplierId) throw new Error("Supplier could not be resolved for checkout session");
      if (purchaseType !== "lead" && purchaseType !== "monthly" && purchaseType !== "yearly") throw new Error("Unknown purchase type");

      const paymentReady = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      if (paymentReady) {
        const { error } = await admin.rpc("apply_stripe_purchase_event", {
          // Must match confirm-checkout so one checkout can never be credited twice.
          p_event_id: `checkout_session:${session.id}`,
          p_event_type: event.type,
          p_supplier_id: supplierId,
          p_purchase_type: purchaseType,
          p_amount_sek: Math.round((session.amount_total || 0) / 100),
          p_subscription_id: typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null,
        });
        if (error) throw error;
      } else {
        console.log("stripe-webhook checkout awaiting payment", session.id, session.payment_status);
      }
    }

    if (event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const supplierId = await resolveSupplierId(customerId, subscription.metadata?.user_id);
      if (!supplierId) throw new Error("Supplier could not be resolved for subscription");

      const hasMonthlyPrice = subscription.items.data.some(item => item.price.id === monthlyPriceId);
      const active = hasMonthlyPrice && (subscription.status === "active" || subscription.status === "trialing");

      const { error } = await admin.rpc("apply_stripe_subscription_state", {
        p_event_id: event.id,
        p_event_type: event.type,
        p_supplier_id: supplierId,
        p_active: active,
        p_subscription_id: active ? subscription.id : null,
      });
      if (error) throw error;
    }

    return json({ received: true });
  } catch (error) {
    console.error("stripe-webhook processing failed", event.id, error);
    return json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, 500);
  }
});
