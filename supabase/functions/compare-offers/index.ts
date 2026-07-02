import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const aiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const auth = req.headers.get("authorization") ?? "";
    const db = createClient(url, key, { global: { headers: { authorization: auth } } });
    const { data: authData } = await db.auth.getUser();
    if (!authData.user) return reply({ error: "Du måste vara inloggad." }, 401);

    const { project_id } = await req.json();
    const { data: project } = await db.from("projects")
      .select("id,buyer_id,title,description,category,budget_range,start_time")
      .eq("id", project_id).maybeSingle();
    if (!project || project.buyer_id !== authData.user.id) return reply({ error: "Projektet saknas eller tillhör inte dig." }, 403);

    const { data: offers, error } = await db.from("offers")
      .select("id,title,description,price,delivery_weeks,payment_plan,status,supplier_id,profiles!offers_supplier_id_fkey(company_name,full_name,city),supplier_profiles:supplier_id(avg_rating,review_count,completed_projects,verified_level)")
      .eq("project_id", project_id).in("status", ["pending", "accepted"]).order("created_at");
    if (error) throw error;
    if (!offers || offers.length < 2) return reply({ error: "Minst två offerter krävs." }, 400);

    const { data: cached } = await db.from("offer_comparisons")
      .select("result,offer_count").eq("project_id", project_id).maybeSingle();
    if (cached?.offer_count === offers.length) return reply({ comparison: cached.result, cached: true });

    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Agera som neutral svensk inköpsrådgivare. Returnera endast JSON. Rekommendera aldrig en viss byrå och hitta inte på fakta." },
          { role: "user", content: `Jämför offerterna för projektet. JSON-format: {summary:string,offers:[{offer_id:string,strengths:string[],weaknesses:string[],price_assessment:'lågt'|'rimligt'|'högt',flags:string[]}],recommendation:string}. Projekt: ${JSON.stringify(project)} Offerter: ${JSON.stringify(offers)}` },
        ],
      }),
    });
    if (!ai.ok) return reply({ error: "AI-jämförelsen kunde inte skapas." }, ai.status === 429 ? 429 : 500);
    const payload = await ai.json();
    const result = JSON.parse(payload.choices?.[0]?.message?.content ?? "{}");
    const ids = new Set(offers.map((offer) => offer.id));
    result.offers = Array.isArray(result.offers) ? result.offers.filter((item: { offer_id?: string }) => item.offer_id && ids.has(item.offer_id)) : [];

    const { error: saveError } = await db.from("offer_comparisons").upsert({
      project_id,
      result,
      offer_count: offers.length,
      updated_at: new Date().toISOString(),
    }, { onConflict: "project_id" });
    if (saveError) throw saveError;
    return reply({ comparison: result, cached: false });
  } catch (error) {
    console.error(error);
    return reply({ error: error instanceof Error ? error.message : "Okänt fel." }, 500);
  }
});
