export type VisibilityPlanKey = "monitor" | "growth" | "agency";
export type VisibilityCadence = "weekly" | "monthly";

export type VisibilityPlan = {
  key: VisibilityPlanKey;
  name: string;
  priceSek: number;
  cadence: VisibilityCadence;
  workspaceLimit: number;
  trackedQueryLimit: number;
  description: string;
  features: string[];
};

export const VISIBILITY_PLANS: Record<VisibilityPlanKey, VisibilityPlan> = {
  monitor: {
    key: "monitor",
    name: "Monitor",
    priceSek: 299,
    cadence: "monthly",
    workspaceLimit: 1,
    trackedQueryLimit: 30,
    description: "För ett företag som vill följa sin AI- och lokala synlighet utan en tung SEO-svit.",
    features: [
      "1 domän / arbetsyta",
      "Upp till 30 prioriterade frågor",
      "AI-observationer och källor",
      "Lokal synlighetsaudit",
      "Månadsvis uppföljningsplan",
    ],
  },
  growth: {
    key: "growth",
    name: "Growth",
    priceSek: 699,
    cadence: "weekly",
    workspaceLimit: 3,
    trackedQueryLimit: 100,
    description: "För företag som vill arbeta löpande med synlighet och omsätta fynd till konkreta åtgärder.",
    features: [
      "Upp till 3 domäner / arbetsytor",
      "Upp till 100 prioriterade frågor totalt",
      "Veckovis uppföljningsplan",
      "Åtgärdskö och mäthistorik",
      "Veckorapport per arbetsyta",
    ],
  },
  agency: {
    key: "agency",
    name: "Agency",
    priceSek: 1490,
    cadence: "weekly",
    workspaceLimit: 10,
    trackedQueryLimit: 300,
    description: "För byråer och managed upplägg med flera kunddomäner och återkommande uppföljning.",
    features: [
      "Upp till 10 kundarbetsytor",
      "Upp till 300 prioriterade frågor totalt",
      "Veckovis uppföljningsplan",
      "Delade molnarbetsytor för Updro-admin",
      "Export och rapport per kund",
    ],
  },
};

export function normalizeVisibilityPlanKey(value: unknown): VisibilityPlanKey {
  return value === "growth" || value === "agency" ? value : "monitor";
}

export function nextVisibilityRun(
  cadence: VisibilityCadence,
  from = new Date(),
): Date {
  const next = new Date(from);
  if (cadence === "weekly") {
    next.setUTCDate(next.getUTCDate() + 7);
  } else {
    next.setUTCMonth(next.getUTCMonth() + 1);
  }
  return next;
}

export function formatVisibilityCadence(cadence: VisibilityCadence) {
  return cadence === "weekly" ? "Varje vecka" : "Varje månad";
}
