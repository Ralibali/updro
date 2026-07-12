import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = new Set([
  "Webbutveckling", "E-handel", "Digital marknadsföring", "Grafisk design/UX",
  "SEO", "App-utveckling", "IT-konsult", "Sociala medier", "Mjukvaruutveckling",
  "Video & foto", "Varumärke & PR", "UX/Webbdesign", "Underhåll/IT Support",
  "Affärsutveckling", "AI-utveckling",
]);

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

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

async function logCall(admin: ReturnType<typeof createClient>, entry: {
  status: number;
  duration_ms: number;
  error?: string | null;
  meta?: Record<string, unknown>;
  ip_hash?: string | null;
}) {
  try {
    await admin.from("edge_function_logs").insert({
      function_name: "improve-description",
      status_code: entry.status,
      duration_ms: entry.duration_ms,
      ok: entry.status >= 200 && entry.status < 400,
      error: entry.error || null,
      meta: entry.meta || {},
      ip_hash: entry.ip_hash || null,
    });
  } catch (error) {
    console.error("log insert failed", error);
  }
}

serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metoden stöds inte." }, 405);

  const started = Date.now();
  const ipHash = await hashIp(clientIp(req));
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const lovableKey = Deno.env.get("LOVABLE_API_KEY") || "";

  if (!supabaseUrl || !serviceKey || !lovableKey) {
    return json({ error: "AI-tjänsten är inte tillgänglig just nu." }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const finish = (body: unknown, status = 200, error?: string | null, meta: Record<string, unknown> = {}) => {
    void logCall(admin, {
      status,
      duration_ms: Date.now() - started,
      error: error || null,
      meta,
      ip_hash: ipHash,
    });
    return json(body, status);
  };

  try {
    const { data: allowed, error: rateError } = await admin.rpc("consume_edge_rate_limit", {
      p_key: `improve-description:${ipHash}`,
      p_limit: 8,
      p_window_seconds: 3600,
    });
    if (rateError) throw rateError;
    if (!allowed) return finish({ error: "För många AI-förfrågningar. Försök igen senare." }, 429, "rate_limited");

    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 100) : "";
    const category = typeof body?.category === "string" ? body.category.trim().slice(0, 80) : "";
    const description = typeof body?.description === "string" ? body.description.trim().slice(0, 5000) : "";

    if (!CATEGORIES.has(category)) return finish({ error: "Välj en giltig kategori." }, 400, "invalid_category");
    if (description.length < 10) return finish({ error: "Beskriv uppdraget med minst 10 tecken." }, 400, "brief_too_short");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Du är en expert på att skriva tydliga och professionella projektbeskrivningar för digitala uppdrag inom kategorin "${category}".

Ta den befintliga beskrivningen och förbättra den. Gör den:
- Tydligare och mer strukturerad
- Mer detaljerad, men inte onödigt lång
- Professionell och lättläst
- Relevant för byråer som ska lämna offert

Behåll kärnan i originalet. Svara enbart med den förbättrade svenska beskrivningen. Max 700 tecken.`,
          },
          {
            role: "user",
            content: `Titel: ${title || "Ej angiven"}\nKategori: ${category}\nBeskrivning: ${description}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return finish({ error: "För många förfrågningar. Försök igen senare." }, 429, "ai_rate_limited");
      if (response.status === 402) return finish({ error: "AI-funktionen är tillfälligt pausad." }, 503, "ai_credits_exhausted");
      console.error("AI gateway error:", response.status, await response.text());
      return finish({ error: "Beskrivningen kunde inte förbättras just nu." }, 502, `ai_gateway_${response.status}`);
    }

    const data = await response.json();
    const improved = String(data.choices?.[0]?.message?.content || "").trim().slice(0, 5000);
    if (!improved) return finish({ error: "Inget förbättrat förslag kunde skapas." }, 502, "empty_ai_response");

    return finish({ improved }, 200, null, { category, input_length: description.length, output_length: improved.length });
  } catch (error) {
    console.error("improve-description error:", error);
    return finish({ error: "Beskrivningen kunde inte förbättras just nu." }, 500, error instanceof Error ? error.message : "unknown_error");
  }
});
