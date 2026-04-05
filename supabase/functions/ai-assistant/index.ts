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

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, idioma = "pt-BR", personalidade = "analista", voz_tipo = "masculina", modo = "pergunta", history = [], is_admin = false } = await req.json();

    // Fetch user context data
    const [projectsRes, ticketsRes, profileRes] = await Promise.all([
      supabase.from("projects").select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("tickets").select("*").eq("created_by", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    ]);

    const projects = projectsRes.data || [];
    const tickets = ticketsRes.data || [];
    const profile = profileRes.data;

    const contextData = {
      total_projetos: projects.length,
      projetos: projects.map(p => ({
        titulo: p.title,
        tipo: p.service_type,
        status: p.status,
        criado_em: p.created_at,
        entrega_estimada: p.estimated_delivery,
        url: p.url,
      })),
      projetos_publicados: projects.filter(p => p.status === "published").length,
      projetos_em_andamento: projects.filter(p => p.status === "in_development" || p.status === "in_review").length,
      projetos_pendentes: projects.filter(p => p.status === "awaiting_info" || p.status === "awaiting_approval").length,
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
      executivo: "Seja direto, estratégico e conciso. Foque em KPIs e ações concretas. Fale como um consultor sênior de negócios. Use frases curtas e impactantes.",
      analista: "Seja técnico e explicativo. Detalhe causas e correlações. Apresente dados de forma estruturada com bullet points. Ofereça análises comparativas quando relevante.",
      amigavel: "Seja leve, acessível e encorajador. Use linguagem simples e motivadora. Comemore conquistas do usuário. Seja empático e proativo em oferecer ajuda.",
    };

    const langInstructions = idioma === "en-US"
      ? "Respond entirely in English. Do not mix languages."
      : "Responda inteiramente em Português do Brasil. Não misture idiomas.";

    const vozInstructions = voz_tipo === "feminina"
      ? "Adote um tom confiante, claro e empático, como a FRIDAY do universo Marvel. Profissional mas acessível."
      : "Adote um tom calmo, profundo e preciso, como o JARVIS do universo Marvel. Autoritário mas acolhedor.";

    const roleInstructions = is_admin
      ? `PERFIL: ADMINISTRADOR
Você está auxiliando um administrador da plataforma. Foque em:
- Visão geral de TODOS os projetos e clientes
- Métricas de performance e produtividade
- Alertas sobre prazos e gargalos
- Sugestões de gestão e priorização
- Insights sobre tickets e satisfação dos clientes`
      : `PERFIL: CLIENTE
Você está auxiliando um cliente. Foque em:
- Status e progresso dos projetos do cliente
- Dúvidas sobre o processo de desenvolvimento
- Orientações sobre como usar a plataforma
- Suporte e resolução de problemas
- Sugestões proativas baseadas no contexto`;

    const systemPrompt = `Você é o assistente inteligente da plataforma GamaTec, um sistema avançado de apoio à decisão integrado ao painel do usuário.
Você atua como um ANALISTA DE NEGÓCIOS experiente, com comunicação clara, objetiva e orientada a resultados.

${langInstructions}

${vozInstructions}

${roleInstructions}

Estilo de comunicação: ${personalityMap[personalidade] || personalityMap.analista}

ARQUITETURA DE AGENTES:
Você possui DOIS AGENTES ATIVOS:

1. AGENTE CONVERSACIONAL (REATIVO)
- Ativado quando o usuário faz perguntas
- Responde com: Insight → Explicação → Sugestão
- Seja específico e use os dados reais

2. AGENTE PROATIVO (AUTÔNOMO)
- Ativado automaticamente
- Analisa o painel e gera insights
- Destaca problemas e sugere ações

VOZ E LEITURA:
- Suas respostas podem ser lidas por voz
- Escreva de forma natural para fala
- Frases curtas e claras
- Use pontuação correta para pausas naturais
- Sem emojis excessivos (máximo 1-2 por resposta)

FORMATO DE RESPOSTA:
- Use **negrito** para destacar dados importantes
- Use bullet points para listas
- Mantenha respostas entre 2-4 parágrafos
- Termine com uma sugestão ou pergunta quando relevante

MEMÓRIA DE CONTEXTO:
Considere as mensagens anteriores da conversa para manter continuidade e evitar repetições.

MODO DE OPERAÇÃO:
${modo === "proativo" ? `MODO PROATIVO:
- Gere 1 insight principal baseado nos dados
- Informe o status geral de forma concisa
- Destaque problemas se existirem
- Ideal para leitura em voz (max 3 frases)` 
: `MODO CONVERSACIONAL:
- Estruture: Insight → Explicação → Sugestão
- Seja direto e útil
- Priorize insights relevantes baseados nos dados reais
- Se o usuário perguntar algo fora do escopo, redirecione educadamente`}

DADOS DO USUÁRIO "${profile?.full_name || "Cliente"}":
${JSON.stringify(contextData, null, 2)}

REGRAS CRÍTICAS:
- Não invente dados. Use apenas o que foi fornecido.
- Se não houver dados, diga que não há dados disponíveis e sugira ações.
- Seja direto e profissional.
- Evite frases genéricas. Priorize valor real.
- Ao final de respostas longas, sugira uma próxima ação ou pergunta.`;

    // Build messages array with conversation history
    const aiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history for context continuity
    if (history && Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (h.role && h.content) {
          aiMessages.push({ role: h.role, content: h.content });
        }
      }
    }

    aiMessages.push({ role: "user", content: message });

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        max_tokens: 1024,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
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
