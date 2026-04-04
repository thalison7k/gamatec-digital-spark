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
      executivo: "Seja direto, estratégico e conciso. Foque em KPIs e ações. Fale como um consultor sênior.",
      analista: "Seja técnico e explicativo. Detalhe causas e correlações. Apresente dados de forma estruturada.",
      amigavel: "Seja leve, acessível e encorajador. Use linguagem simples e motivadora.",
    };

    const langInstructions = idioma === "en-US"
      ? "Respond entirely in English. Do not mix languages."
      : "Responda inteiramente em Português do Brasil. Não misture idiomas.";

    const vozInstructions = voz_tipo === "feminina"
      ? "Adote um tom confiante e claro, como a FRIDAY do universo Marvel. Voz feminina profissional."
      : "Adote um tom calmo, profundo e preciso, como o JARVIS do universo Marvel. Voz masculina autoritária.";

    const systemPrompt = `Você é o assistente inteligente da plataforma GamaTec, integrado diretamente ao painel do usuário.

${langInstructions}

${vozInstructions}

Estilo de comunicação: ${personalityMap[personalidade] || personalityMap.analista}

IDIOMA E VOZ:
- Responda no idioma: ${idioma}
- As respostas devem ser naturais para leitura em voz alta
- Use frases curtas, claras e fluidas
- Evite emojis excessivos, símbolos ou markdown complexo
- Use pontuação correta para pausas naturais

MODO DE OPERAÇÃO:
${modo === "proativo" ? `MODO PROATIVO (PRINCIPAL):
- Analise os dados exibidos na tela
- Gere um insight automático curto (1-3 frases)
- Destaque o status geral dos projetos
- Informe se há problemas ou pendências
- Sugira ação se necessário

Exemplos:
- "Você possui um projeto concluído e já publicado. Nenhuma pendência no momento."
- "Seu projeto está com 100% de progresso e disponível online."
- "Há pendências que podem impactar a entrega. Recomendo verificar os itens em aberto."` 
: `MODO CONVERSACIONAL:
- Responda a pergunta do usuário com: insight principal, explicação breve, sugestão prática
- Seja direto e útil
- Priorize insights relevantes baseados nos dados reais`}

DADOS DO USUÁRIO "${profile?.full_name || "Cliente"}":
${JSON.stringify(contextData, null, 2)}

REGRAS CRÍTICAS:
- Não invente dados. Use apenas o que foi fornecido.
- Se não houver dados, diga que não há dados disponíveis e sugira ações.
- Evite frases genéricas. Seja específico com os dados do usuário.
- Priorize insights úteis e acionáveis.
- Você não é apenas um chat. Você é um assistente ativo que observa a plataforma e ajuda o usuário automaticamente.`;

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
