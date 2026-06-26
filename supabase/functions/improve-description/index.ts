import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    if (body?.action === "submit_guest_lead") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !serviceKey) return jsonResponse({ error: "Servern är inte korrekt konfigurerad." }, 500);

      const response = await fetch(`${supabaseUrl}/functions/v1/submit-guest-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
          "apikey": serviceKey,
        },
        body: JSON.stringify(body.payload || {}),
      });

      const result = await response.json();
      return jsonResponse(result, response.status);
    }

    const { title, category, description } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `Du är en expert på att skriva tydliga och professionella projektbeskrivningar för digitala uppdrag inom kategorin "${category}".

Din uppgift: Ta den befintliga beskrivningen och förbättra den. Gör den:
- Tydligare och mer strukturerad
- Mer detaljerad (men inte onödigt lång)
- Professionell men lättläst
- Inkludera relevanta punkter som byråer vill veta (mål, målgrupp, funktioner, tidsram etc.)

Behåll kärnan i originalets budskap. Svara ENBART med den förbättrade beskrivningen, inget annat. Skriv på svenska. Max 500 tecken.`,
            },
            {
              role: "user",
              content: `Titel: ${title}\nKategori: ${category}\nBeskrivning: ${description}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) return jsonResponse({ error: "För många förfrågningar, försök igen om en stund." }, 429);
      if (response.status === 402) return jsonResponse({ error: "AI-krediter slut." }, 402);
      const responseText = await response.text();
      console.error("AI gateway error:", response.status, responseText);
      return jsonResponse({ error: "AI-fel" }, 500);
    }

    const data = await response.json();
    const improved = data.choices?.[0]?.message?.content?.trim() || "";
    return jsonResponse({ improved });
  } catch (error) {
    console.error("improve-description error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Okänt fel" }, 500);
  }
});
