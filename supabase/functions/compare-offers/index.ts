Deno.serve(() => new Response(JSON.stringify({ error: "Not configured" }), { status: 501, headers: { "Content-Type": "application/json" } }));
