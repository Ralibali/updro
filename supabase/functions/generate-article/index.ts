import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { topic, category, keywords } = await req.json();

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
              content: `Du är en expert-skribent för Updro.se – en svensk marknadsplats som kopplar ihop företag med digitala byråer (webbutveckling, SEO, e-handel, apputveckling, digital marknadsföring m.m.).

Skriv en kunskapsbanks-artikel i Markdown-format. Artikeln ska:
- Vara informativ, engagerande och SEO-optimerad för svenska sökningar
- Ha en tydlig struktur med H2- och H3-rubriker
- Vara 800–1200 ord
- Inkludera konkreta tips och exempel
- Ha en naturlig, professionell ton (inte säljig)
- Avsluta med en kort sammanfattning

Svara ENBART med artikelinnehållet i Markdown. Ingen meta-text eller förklaringar.`,
            },
            {
              role: "user",
              content: `Skriv en artikel om: ${topic}${category ? `\nKategori: ${category}` : ''}${keywords ? `\nNyckelord att inkludera: ${keywords}` : ''}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "För många förfrågningar, försök igen om en stund." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI-krediter slut." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI-fel" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    // Extract first line as suggested title
    const firstLine = content.split('\n').find((l: string) => l.trim().length > 0) || topic;
    const title = firstLine.replace(/^#+\s*/, '').trim();

    // Estimate reading time (200 words/min)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    // Generate description from first paragraph after title
    const paragraphs = content.split('\n\n').filter((p: string) => !p.startsWith('#') && p.trim().length > 20);
    const description = (paragraphs[0] || topic).slice(0, 160).trim();

    return new Response(
      JSON.stringify({ content, title, description, reading_time_minutes: readingTime }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-article error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Okänt fel" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
