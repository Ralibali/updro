import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = [
  "Webbutveckling", "E-handel", "Digital marknadsföring",
  "Grafisk design/UX", "SEO", "App-utveckling",
  "IT-konsult", "Sociala medier",
  "Mjukvaruutveckling", "Video & foto", "Varumärke & PR",
  "UX/Webbdesign", "Underhåll/IT Support", "Affärsutveckling", "AI-utveckling",
];

const BUDGETS = ["under_10k", "10k_50k", "50k_150k", "over_150k", "unknown"];
const STARTS = ["asap", "within_month", "within_3months", "flexible"];

const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ||
  request.headers.get("x-real-ip") ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "unknown";

async function hashIp(ip: string) {
  try {
    const salt = Deno.env.get("RATE_LIMIT_SALT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "updro";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
    return Array.from(new Uint8Array(digest)).slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch { return "unknown"; }
}

async function logCall(entry: { status: number; duration_ms: number; error?: string | null; meta?: Record<string, unknown>; ip_hash?: string | null }) {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const admin = createClient(url, key, { auth: { persistSession: false } });
    await admin.from("edge_function_logs").insert({
      function_name: "analyze-brief",
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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metoden stöds inte." }, 405);

  const started = Date.now();
  const ip_hash = await hashIp(clientIp(req));
  const finish = (response: Response, error?: string | null, meta: Record<string, unknown> = {}) => {
    const duration_ms = Date.now() - started;
    console.log(JSON.stringify({ fn: "analyze-brief", status: response.status, duration_ms, error: error || null, ...meta }));
    void logCall({ status: response.status, duration_ms, error, meta, ip_hash });
    return response;
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !serviceKey) {
      return finish(json({ error: "AI-tjänsten är inte korrekt konfigurerad." }, 500), "missing_backend_env");
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: allowed, error: rateError } = await admin.rpc("consume_edge_rate_limit", {
      p_key: `analyze-brief:${ip_hash}`,
      p_limit: 12,
      p_window_seconds: 3600,
    });
    if (rateError) throw rateError;
    if (!allowed) {
      return finish(json({ error: "För många AI-förfrågningar. Försök igen senare." }, 429), "rate_limited");
    }

    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text.trim().slice(0, 5000) : "";
    if (text.length < 10) {
      return finish(json({ error: "Beskriv behovet med minst 10 tecken." }, 400), "missing_text");
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return finish(json({ error: "AI-tjänsten är inte tillgänglig just nu." }, 500), "missing_api_key");

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
            content: `Du är en svensk projektanalytiker som hjälper beställare att specificera digitala uppdrag på en marknadsplats.
Givet en fritext, returnera ett strukturerat förslag via verktyget extract_brief.
Skriv allt på svenska. Var kortfattad och konkret.

För price_estimate: uppskatta vad uppdraget rimligen kostar hos en svensk byrå 2026. Förankra uppskattningen i dessa riktvärden för standardnivå per kategori, och justera upp eller ner efter beskriven omfattning:
- Webbutveckling: 40 000–80 000 kr
- E-handel: 80 000–160 000 kr
- SEO: 8 000–15 000 kr/mån
- Digital marknadsföring: 10 000–25 000 kr/mån
- App-utveckling: 250 000–500 000 kr
- Grafisk design/UX: 40 000–80 000 kr
- AI-utveckling: 150 000–400 000 kr
- IT-konsult: 1 250–1 550 kr/timme
- Sociala medier: 15 000–35 000 kr/mån
- Mjukvaruutveckling: 300 000–700 000 kr
- Video & foto: 20 000–60 000 kr
- Varumärke & PR: 50 000–120 000 kr
- UX/Webbdesign: 60 000–140 000 kr
- Underhåll/IT Support: 700–1 200 kr/användare/mån
- Affärsutveckling: 60 000–150 000 kr
Vid löpande priser (per månad/timme/användare) ska min_sek och max_sek avse samma enhet, och reasoning ska ange enheten. reasoning: max 200 tecken, svenska, förklara kort vad som påverkar priset mest för just detta uppdrag.`,
          },
          {
            role: "user",
            content: `Analysera följande projektidé och returnera struktur via extract_brief:\n\n${text}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_brief",
              description: "Extrahera ett strukturerat projektbrief från fritext.",
              parameters: {
                type: "object",
                properties: {
                  category: { type: "string", enum: CATEGORIES },
                  title: { type: "string", maxLength: 100 },
                  description: { type: "string", maxLength: 600 },
                  budget_range: { type: "string", enum: BUDGETS },
                  start_time: { type: "string", enum: STARTS },
                  requirements: { type: "array", items: { type: "string" }, maxItems: 6 },
                  questions_for_agencies: { type: "array", items: { type: "string" }, maxItems: 5 },
                  lead_score: { type: "integer", minimum: 0, maximum: 100 },
                  estimated_matching_agencies: { type: "integer", minimum: 0, maximum: 100 },
                  price_estimate: {
                    type: "object",
                    properties: {
                      min_sek: { type: "integer", minimum: 0 },
                      max_sek: { type: "integer", minimum: 0 },
                      reasoning: { type: "string", maxLength: 200 },
                    },
                    required: ["min_sek", "max_sek", "reasoning"],
                    additionalProperties: false,
                  },
                },
                required: ["category", "title", "description", "budget_range", "start_time", "requirements", "questions_for_agencies", "lead_score", "estimated_matching_agencies", "price_estimate"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_brief" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return finish(json({ error: "För många förfrågningar. Försök igen senare." }, 429), "ai_rate_limited", { input_length: text.length });
      if (response.status === 402) return finish(json({ error: "AI-funktionen är tillfälligt pausad." }, 503), "ai_credits_exhausted", { input_length: text.length });
      console.error("AI gateway error:", response.status, await response.text());
      return finish(json({ error: "AI-analysen kunde inte genomföras just nu." }, 502), `ai_gateway_${response.status}`, { input_length: text.length });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return finish(json({ error: "Inget förslag kunde genereras." }, 502), "no_tool_call", { input_length: text.length });
    }

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (error) {
      console.error("Could not parse tool args", error);
      return finish(json({ error: "Kunde inte tolka AI-svaret." }, 502), "parse_failed", { input_length: text.length });
    }

    return finish(json({ brief: parsed }), null, {
      input_length: text.length,
      category: parsed.category,
      lead_score: parsed.lead_score,
    });
  } catch (error) {
    console.error("analyze-brief error:", error);
    return finish(json({ error: "AI-analysen kunde inte genomföras just nu." }, 500), error instanceof Error ? error.message : "unknown_error");
  }
});
