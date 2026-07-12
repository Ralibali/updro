// Shared billing plan configuration for edge functions.
// Reads Stripe price IDs from the Deno environment. No fallback IDs.

export type BillingPlanId = "lead" | "monthly" | "yearly";
export type BillingPlanMode = "payment" | "subscription";

export interface BillingPlan {
  id: BillingPlanId;
  priceId: string;
  mode: BillingPlanMode;
}

const ENV_KEYS: Record<BillingPlanId, string> = {
  lead: "STRIPE_LEAD_PRICE_ID",
  monthly: "STRIPE_MONTHLY_PRICE_ID",
  yearly: "STRIPE_YEARLY_PRICE_ID",
};

const MODES: Record<BillingPlanId, BillingPlanMode> = {
  lead: "payment",
  monthly: "subscription",
  yearly: "subscription",
};

const SUBSCRIPTION_PLAN_IDS: readonly BillingPlanId[] = ["monthly", "yearly"];

export class BillingConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingConfigError";
  }
}

function readPriceId(planId: BillingPlanId): string {
  const envKey = ENV_KEYS[planId];
  const value = Deno.env.get(envKey);
  if (!value || value.trim() === "") {
    throw new BillingConfigError(
      `Missing required environment variable ${envKey} for billing plan "${planId}".`,
    );
  }
  return value;
}

export function isBillingPlanId(value: unknown): value is BillingPlanId {
  return value === "lead" || value === "monthly" || value === "yearly";
}

export function getBillingPlan(planId: BillingPlanId): BillingPlan {
  if (!isBillingPlanId(planId)) {
    throw new BillingConfigError(`Unknown billing plan "${String(planId)}".`);
  }
  return {
    id: planId,
    priceId: readPriceId(planId),
    mode: MODES[planId],
  };
}

export function getSubscriptionPriceIds(): Set<string> {
  return new Set(SUBSCRIPTION_PLAN_IDS.map((id) => readPriceId(id)));
}
