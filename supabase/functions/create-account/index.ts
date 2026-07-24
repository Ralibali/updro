import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = new Set([
  "Webbutveckling", "E-handel", "Digital marknadsföring",
  "Grafisk design/UX", "SEO", "App-utveckling",
  "IT-konsult", "Sociala medier", "Mjukvaruutveckling",
  "Video & foto", "Varumärke & PR", "UX/Webbdesign",
  "Underhåll/IT Support", "Affärsutveckling", "AI-utveckling",
]);

const TRIAL_LEADS = 5;
const TRIAL_DAYS = 7;
// Värvning: värvaren får 10 leads, den nya byrån 5 extra.
const REFERRAL_BONUS_CREDITS = 10;
const REFERRAL_NEW_SUPPLIER_BONUS = 5;

type CampaignCodeRow = {
  code: string;
  trial_days: number;
  lead_credits: number;
  max_uses: number;
  used_count: number;
  active: boolean;
};

type SignUpBody = {
  email?: string;
  password?: string;
  role?: string;
  full_name?: string;
  company_name?: string;
  city?: string;
  phone?: string;
  categories?: string[];
  org_number?: string;
  campaign_code?: string;
  referral_code?: string;
};

function cleanText(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function slugify(input: string, suffix: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9åäö]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
  return `${slug || "byra"}-${suffix}`;
}

// Deterministisk värvningskod per användare (8 hextecken från SHA-256).
async function referralCodeFor(userId: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${userId}-updro-ref`));
  return Array.from(new Uint8Array(digest)).slice(0, 4).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

const normalizeCode = (value: unknown) =>
  typeof value === "string" ? value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32) : "";

const safeOrigin = (rawOrigin: string | null) => {
  if (!rawOrigin) return "https://updro.se";
  if (rawOrigin === "https://updro.se" || rawOrigin === "https://www.updro.se") return rawOrigin;
  if (/^http:\/\/localhost:\d+$/.test(rawOrigin)) return rawOrigin;
  if (/^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(rawOrigin)) return rawOrigin;
  return "https://updro.se";
};

const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ||
  request.headers.get("x-real-ip") ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "unknown";

async function hashIp(ip: string) {
  try {
    const salt = Deno.env.get("RATE_LIMIT_SALT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "updro";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
    return Array.from(new Uint8Array(digest)).slice(0, 12).map(byte => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    return "unknown";
  }
}

serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metoden stöds inte." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("create-account missing backend secrets");
    return json({ error: "Registreringen är inte korrekt konfigurerad just nu." }, 500);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as SignUpBody;
    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;
    const fullName = cleanText(body.full_name, 120);
    const companyName = cleanText(body.company_name, 160);
    const city = cleanText(body.city, 80);
    const phone = cleanText(body.phone, 40);
    const orgNumber = cleanText(body.org_number, 32);
    const categories = Array.isArray(body.categories)
      ? body.categories.filter(category => typeof category === "string" && CATEGORIES.has(category)).slice(0, 10)
      : [];

    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Ange en giltig e-postadress." }, 400);
    if (password.length < 8) return json({ error: "Lösenordet måste vara minst åtta tecken." }, 400);
    if (role !== "buyer" && role !== "supplier") return json({ error: "Ogiltig kontotyp." }, 400);
    if (fullName.length < 2) return json({ error: "Ange ditt namn." }, 400);
    if (role === "supplier" && companyName.length < 2) return json({ error: "Ange byrånamn." }, 400);
    if (role === "supplier" && categories.length === 0) return json({ error: "Välj minst en kategori." }, 400);

    const publicClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const ipHash = await hashIp(clientIp(req));
    const { data: allowed, error: rateError } = await adminClient.rpc("consume_edge_rate_limit", {
      p_key: `create-account:${ipHash}`,
      p_limit: 6,
      p_window_seconds: 3600,
    });
    if (rateError) throw rateError;
    if (!allowed) return json({ error: "För många registreringsförsök. Försök igen senare." }, 429);

    const origin = safeOrigin(req.headers.get("origin"));
    const emailRedirectTo = `${origin}/logga-in?confirmed=true`;

    const { data: authData, error: authError } = await publicClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          role,
          full_name: fullName,
          company_name: companyName || null,
        },
      },
    });

    if (authError) {
      const message = authError.message.toLowerCase().includes("already")
        ? "Det finns redan ett konto med den e-postadressen. Logga in istället."
        : "Kunde inte skapa kontot. Kontrollera uppgifterna och försök igen.";
      console.error("create-account auth error", authError.message);
      return json({ error: message }, 400);
    }

    const user = authData.user;
    if (!user?.id) return json({ error: "Kunde inte skapa konto." }, 500);

    const { error: profileError } = await adminClient.from("profiles").insert({
      id: user.id,
      role,
      full_name: fullName,
      email,
      company_name: companyName || null,
      city: city || null,
      phone: phone || null,
    });

    if (profileError) {
      if (profileError.code !== "23505") await adminClient.auth.admin.deleteUser(user.id);
      const message = profileError.code === "23505"
        ? "Det finns redan ett konto med den e-postadressen. Logga in istället."
        : "Kunde inte skapa profil. Försök igen.";
      console.error("create-account profile error", profileError);
      return json({ error: message }, 400);
    }

    // Kampanjkod valideras innan kontot skapas – ogiltig kod stoppar aldrig
    // registreringen, den ger bara standardvillkor istället.
    const campaignCodeInput = normalizeCode(body.campaign_code);
    const referralCodeInput = normalizeCode(body.referral_code);

    let campaign: CampaignCodeRow | null = null;
    let campaignInvalid = false;
    if (role === "supplier" && campaignCodeInput) {
      const { data: campaignRow, error: campaignError } = await adminClient
        .from("campaign_codes")
        .select("code, trial_days, lead_credits, max_uses, used_count, active")
        .eq("code", campaignCodeInput)
        .eq("active", true)
        .maybeSingle();
      if (campaignError) {
        console.error("create-account campaign lookup error", campaignError);
      }
      if (campaignRow && campaignRow.used_count < campaignRow.max_uses) {
        campaign = campaignRow as CampaignCodeRow;
      } else {
        campaignInvalid = true;
      }
    }

    let referrer: { id: string; lead_credits: number | null } | null = null;
    if (role === "supplier" && referralCodeInput) {
      const { data: referrerRow, error: referrerError } = await adminClient
        .from("supplier_profiles")
        .select("id, lead_credits")
        .eq("referral_code", referralCodeInput)
        .neq("id", user.id)
        .maybeSingle();
      if (referrerError) {
        console.error("create-account referral lookup error", referrerError);
      } else {
        referrer = referrerRow;
      }
    }

    let appliedCampaign: { code: string; trialDays: number; leadCredits: number } | null = null;

    if (role === "supplier") {
      const trialDays = campaign?.trial_days ?? TRIAL_DAYS;
      const trialLeads = (campaign?.lead_credits ?? TRIAL_LEADS) + (referrer ? REFERRAL_NEW_SUPPLIER_BONUS : 0);
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + trialDays);

      const { error: supplierError } = await adminClient.from("supplier_profiles").insert({
        id: user.id,
        slug: slugify(companyName || fullName, user.id.slice(0, 6)),
        plan: "trial",
        trial_ends_at: trialEnds.toISOString(),
        lead_credits: trialLeads,
        trial_leads_used: 0,
        categories,
        org_number: orgNumber || null,
        contact_name: fullName,
        contact_email: email,
        contact_phone: phone || null,
        referral_code: await referralCodeFor(user.id),
        referred_by: referrer ? referralCodeInput : null,
        campaign_code: campaign?.code ?? null,
      });

      if (supplierError) {
        await adminClient.auth.admin.deleteUser(user.id);
        console.error("create-account supplier error", supplierError);
        return json({ error: "Kunde inte skapa byråprofil. Försök igen." }, 400);
      }

      if (campaign) {
        const { error: campaignUseError } = await adminClient
          .from("campaign_codes")
          .update({ used_count: campaign.used_count + 1 })
          .eq("code", campaign.code);
        if (campaignUseError) console.error("create-account campaign use-count error", campaignUseError);
        appliedCampaign = { code: campaign.code, trialDays: campaign.trial_days, leadCredits: campaign.lead_credits };
      }

      if (referrer) {
        const { error: referrerBonusError } = await adminClient
          .from("supplier_profiles")
          .update({ lead_credits: (referrer.lead_credits ?? 0) + REFERRAL_BONUS_CREDITS })
          .eq("id", referrer.id);
        if (referrerBonusError) console.error("create-account referral bonus error", referrerBonusError);
      }
    }

    // Guest assignments are deliberately claimed after the first verified login,
    // never during unverified registration.
    return json({
      userId: user.id,
      session: authData.session,
      needsEmailConfirmation: !authData.session,
      campaign: appliedCampaign,
      campaignInvalid,
      referralApplied: Boolean(referrer),
    });
  } catch (error) {
    console.error("create-account error", error);
    return json({ error: "Något gick fel vid registrering." }, 500);
  }
});
