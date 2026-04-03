const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, idioma = "pt-BR", personalidade = "analista", voz_tipo = "masculina", modo = "pergunta" } = await req.json();

    // Fetch user context data
    const [projectsRes, ticketsRes, profileRes] = await Promise.all([
      supabase.from("projects").select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("tickets").select("*").eq("created_by", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    ]);

    const projects = projectsRes.data || [];
    const tickets = ticketsRes.data || [];
    const profile = profileRes.data;

    // Build context
    const contextData = {
      total_projetos: projects.length,
      projetos: projects.map(p => ({
        titulo: p.title,
        tipo: p.service_type,
        status: p.status,
        criado_em: p.created_at,
        entrega_estimada: p.estimated_delivery,
      })),
      total_tickets: tickets.length,
      tickets_abertos: tickets.filter(t => t.status === "open" || t.status === "in_progress").length,
      tickets: tickets.map(t => ({
        assunto: t.subject,
        status: t.status,
        prioridade: t.priority,
        criado_em: t.created_at,
      })),
    };

    const personalityMap: Record<string, string> = {
      executivo: "Seja direto, estratégico e conciso. Foque em KPIs e ações.",
      analista: "Seja técnico e explicativo. Detalhe causas e correlações.",
      amigavel: "Seja leve, acessível e encorajador. Use linguagem simples.",
    };

    const langInstructions = idioma === "en-US"
      ? "Respond entirely in English. Do not mix languages."
      : "Responda inteiramente em Português do Brasil. Não misture idiomas.";

    const systemPrompt = `Você é o assistente inteligente da plataforma GamaTec, um sistema de gestão de projetos web.

${langInstructions}

Estilo de comunicação: ${personalityMap[personalidade] || personalityMap.analista}

Sua resposta pode ser convertida em áudio, então:
- Use frases curtas e bem estruturadas
- Evite emojis excessivos, símbolos ou markdown complexo
- Use pontuação correta para pausas naturais
- Seja direto e útil

Dados do usuário "${profile?.full_name || "Cliente"}":
${JSON.stringify(contextData, null, 2)}

Regras:
- Não invente dados. Use apenas o que foi fornecido.
- Se não houver dados, diga que não há dados disponíveis e sugira ações.
- Priorize insights relevantes.
- ${modo === "proativo" ? "Gere insights curtos (1-2 frases) sobre o estado atual." : "Responda a pergunta do usuário com: insight principal, explicação breve, sugestão prática."}`;

    // Call AI via Lovable gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", errText);
      return new Response(JSON.stringify({ error: "Falha ao consultar IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
