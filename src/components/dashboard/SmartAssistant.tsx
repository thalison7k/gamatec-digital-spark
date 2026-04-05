import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Volume2, VolumeX, Settings2, Sparkles, Save, Trash2, MessageSquare, Loader2, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Personalidade = "executivo" | "analista" | "amigavel";
type Idioma = "pt-BR" | "en-US";
type VozGenero = "masculino" | "feminino";

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp?: string;
}

interface SmartAssistantProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS_PT = [
  "Qual o status dos meus projetos?",
  "Tenho tickets em aberto?",
  "Resuma meu painel atual",
  "Quais ações devo tomar?",
];

const SUGGESTED_QUESTIONS_EN = [
  "What's my project status?",
  "Do I have open tickets?",
  "Summarize my dashboard",
  "What actions should I take?",
];

export default function SmartAssistant({ open, onClose }: SmartAssistantProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [idioma, setIdioma] = useState<Idioma>("pt-BR");
  const [personalidade, setPersonalidade] = useState<Personalidade>("analista");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [vozGenero, setVozGenero] = useState<VozGenero>("masculino");
  const [showSettings, setShowSettings] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preload voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handler = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", handler);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", handler);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 80);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = idioma === "en-US"
        ? "Hello! I'm the GamaTec smart assistant. I analyze your dashboard data in real-time and provide actionable insights. How can I help you?"
        : "Olá! Sou o assistente inteligente da GamaTec. Analiso seus dados em tempo real e ofereço insights estratégicos. Como posso te ajudar?";
      setMessages([{ role: "assistant", content: greeting, timestamp: new Date().toISOString() }]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setMessages([]);
      setInput("");
      setShowSettings(false);
      setConversationId(null);
    }
  }, [open]);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const clean = text.replace(/[#*_~`>]/g, "").replace(/\[.*?\]\(.*?\)/g, "").replace(/[📌🏢🎯👥🎨📄⚙️✅🎉🚀✓💡📊]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = idioma;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = idioma.split("-")[0];
    const preferred = voices.filter(v => v.lang.startsWith(langPrefix));

    let bestVoice: SpeechSynthesisVoice | undefined;

    if (vozGenero === "feminino") {
      bestVoice = preferred.find(v => v.name.toLowerCase().includes("francisca"))
        || preferred.find(v => v.name.toLowerCase().includes("maria"))
        || preferred.find(v => v.name.toLowerCase().includes("vitoria") || v.name.toLowerCase().includes("vitória"))
        || preferred.find(v => v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("brasileiro"))
        || preferred.find(v => v.name.toLowerCase().includes("female"))
        || preferred[0];
      utterance.rate = 0.95;
      utterance.pitch = 1.15;
    } else {
      bestVoice = preferred.find(v => v.name.toLowerCase().includes("google") && v.name.toLowerCase().includes("brasileiro"))
        || preferred.find(v => v.name.toLowerCase().includes("daniel"))
        || preferred.find(v => v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("feminino") && !v.name.toLowerCase().includes("female") && !v.name.toLowerCase().includes("francisca"))
        || preferred.find(v => v.name.toLowerCase().includes("male") && !v.name.toLowerCase().includes("female"))
        || preferred[1] || preferred[0];
      utterance.rate = 0.88;
      utterance.pitch = 0.75;
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    }
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, idioma, vozGenero]);

  const saveConversation = async () => {
    if (!user || messages.length < 2) return;

    try {
      const title = messages.find(m => m.role === "user")?.content.slice(0, 80) || "Conversa";
      const payload: any = {
        user_id: user.id,
        assistant_type: "smart",
        title,
        messages: JSON.parse(JSON.stringify(messages)),
        metadata: { idioma, personalidade, voz_tipo: vozGenero },
      };

      if (conversationId) {
        await supabase.from("chat_conversations").update({ messages: payload.messages, metadata: payload.metadata }).eq("id", conversationId);
      } else {
        const { data } = await supabase.from("chat_conversations").insert(payload).select("id").single();
        if (data) setConversationId(data.id);
      }

      toast({ title: idioma === "en-US" ? "Conversation saved!" : "Conversa salva!", description: idioma === "en-US" ? "You can access it later." : "Você pode acessá-la depois." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Send conversation history for context memory
      const historyForContext = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const res = await supabase.functions.invoke("ai-assistant", {
        body: {
          message: msg,
          idioma,
          personalidade,
          voz_tipo: vozGenero === "feminino" ? "feminina" : "masculina",
          modo: "pergunta",
          history: historyForContext,
          is_admin: isAdmin,
        },
      });

      const reply = res.data?.reply || (idioma === "en-US" ? "Sorry, I couldn't process your request." : "Desculpe, não consegui processar sua solicitação.");
      setMessages(prev => [...prev, { role: "assistant", content: reply, timestamp: new Date().toISOString() }]);
      speak(reply);
    } catch {
      const errMsg = idioma === "en-US" ? "Connection error. Please try again." : "Erro de conexão. Tente novamente.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const suggestedQuestions = idioma === "en-US" ? SUGGESTED_QUESTIONS_EN : SUGGESTED_QUESTIONS_PT;
  const showSuggestions = messages.length <= 1 && !loading;

  const personalidadeLabels: Record<Personalidade, string> = {
    executivo: idioma === "en-US" ? "Executive" : "Executivo",
    analista: idioma === "en-US" ? "Analyst" : "Analista",
    amigavel: idioma === "en-US" ? "Friendly" : "Amigável",
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg w-[calc(100vw-1rem)] max-h-[90vh] sm:max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-primary/10">
        {/* Header */}
        <DialogHeader className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/50 shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-sm font-orbitron">
              <div className="relative">
                <Sparkles className="h-4 w-4 text-primary" />
                {isSpeaking && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              <span className="hidden sm:inline">{idioma === "en-US" ? "Smart Assistant" : "Assistente Inteligente"}</span>
              <span className="sm:hidden">{idioma === "en-US" ? "Assistant" : "Assistente"}</span>
            </DialogTitle>
            <div className="flex items-center gap-1">
              {isSpeaking && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium mr-1">
                  <AudioLines className="h-3 w-3 animate-pulse" />
                  <span className="hidden sm:inline">{idioma === "en-US" ? "Speaking" : "Falando"}</span>
                </div>
              )}
              <Button
                size="sm"
                variant={ttsEnabled ? "default" : "outline"}
                className="h-7 gap-1 text-[10px] sm:text-xs px-2 rounded-lg transition-all duration-200 active:scale-95"
                onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) { window.speechSynthesis?.cancel(); setIsSpeaking(false); } }}
              >
                {ttsEnabled ? <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <VolumeX className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                <span className="hidden sm:inline">{ttsEnabled ? "Voz On" : "Voz Off"}</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg transition-all duration-200 hover:bg-primary/10 active:scale-95"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 className={cn("h-3.5 w-3.5 transition-transform duration-300", showSettings && "rotate-90")} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Settings panel */}
        {showSettings && (
          <div className="px-3 sm:px-4 py-2.5 border-b border-border/50 bg-muted/20 flex flex-wrap gap-2 sm:gap-3 items-center text-xs shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[10px] sm:text-xs">{idioma === "en-US" ? "Lang:" : "Idioma:"}</span>
              <Select value={idioma} onValueChange={(v) => setIdioma(v as Idioma)}>
                <SelectTrigger className="h-7 w-20 sm:w-24 text-[10px] sm:text-xs rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[10px] sm:text-xs">{idioma === "en-US" ? "Style:" : "Estilo:"}</span>
              <Select value={personalidade} onValueChange={(v) => setPersonalidade(v as Personalidade)}>
                <SelectTrigger className="h-7 w-24 sm:w-28 text-[10px] sm:text-xs rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["executivo", "analista", "amigavel"] as Personalidade[]).map(p => (
                    <SelectItem key={p} value={p}>{personalidadeLabels[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[10px] sm:text-xs">{idioma === "en-US" ? "Voice:" : "Voz:"}</span>
              <Select value={vozGenero} onValueChange={(v) => setVozGenero(v as VozGenero)}>
                <SelectTrigger className="h-7 w-24 sm:w-28 text-[10px] sm:text-xs rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">♂ JARVIS</SelectItem>
                  <SelectItem value="feminino">♀ FRIDAY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0 space-y-3 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mt-1 ring-1 ring-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div className={cn(
                "max-w-[88%] sm:max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted/80 text-foreground rounded-bl-sm border border-border/30"
              )}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0 [&>ul]:mb-1.5 [&>ol]:mb-1.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-line">{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {/* Suggested Questions */}
          {showSuggestions && (
            <div className="space-y-2 animate-in fade-in duration-500" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-1">
                {idioma === "en-US" ? "Suggestions" : "Sugestões"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 text-xs rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/40 transition-all duration-200 active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex gap-2">
              <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mt-1 ring-1 ring-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted/80 rounded-2xl rounded-bl-sm px-4 py-3 border border-border/30">
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border/50 p-2.5 sm:p-3 shrink-0 bg-background/80 backdrop-blur-sm">
          {/* Action bar */}
          {messages.length > 2 && (
            <div className="flex items-center gap-1.5 mb-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] gap-1 px-2 text-muted-foreground hover:text-primary rounded-md"
                onClick={saveConversation}
              >
                <Save className="h-3 w-3" />
                <span className="hidden sm:inline">{idioma === "en-US" ? "Save" : "Salvar"}</span>
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-center">
            <Input
              ref={inputRef}
              placeholder={idioma === "en-US" ? "Ask me anything..." : "Pergunte qualquer coisa..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
              className="bg-muted/30 text-sm rounded-xl border-border/50 focus-visible:ring-primary/30 h-10"
            />
            <Button
              size="icon"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="h-10 w-10 rounded-xl shrink-0 transition-all duration-200 active:scale-90 bg-gradient-to-br from-primary to-cyan-500 hover:shadow-lg hover:shadow-primary/25"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
