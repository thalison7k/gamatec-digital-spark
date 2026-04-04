import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Volume2, VolumeX, Settings2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type Personalidade = "executivo" | "analista" | "amigavel";
type Idioma = "pt-BR" | "en-US";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface SmartAssistantProps {
  open: boolean;
  onClose: () => void;
}

export default function SmartAssistant({ open, onClose }: SmartAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [idioma, setIdioma] = useState<Idioma>("pt-BR");
  const [personalidade, setPersonalidade] = useState<Personalidade>("analista");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);


  // Preload voices (some browsers load them async)
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handler = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", handler);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", handler);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = idioma === "en-US"
        ? "Hello! I'm the GamaTec smart assistant. Ask me about your projects, tickets, or anything else. How can I help you?"
        : "Olá! Sou o assistente inteligente da GamaTec. Pergunte sobre seus projetos, solicitações ou qualquer dúvida. Como posso te ajudar?";
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel();
      setMessages([]);
      setInput("");
      setShowSettings(false);
    }
  }, [open]);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = idioma;

    // JARVIS-style voice selection
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = idioma.split("-")[0];
    const preferred = voices.filter(v => v.lang.startsWith(langPrefix));
    const bestVoice = preferred.find(v => v.name.toLowerCase().includes("google") && v.name.toLowerCase().includes("brasileiro"))
      || preferred.find(v => v.name.toLowerCase().includes("google"))
      || preferred.find(v => v.name.toLowerCase().includes("daniel"))
      || preferred.find(v => v.name.toLowerCase().includes("microsoft"))
      || preferred.find(v => v.name.toLowerCase().includes("natural"))
      || preferred[0];

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    }

    // JARVIS voice profile: calm, deep, precise
    utterance.rate = 0.88;
    utterance.pitch = 0.75;
    utterance.volume = 1.0;

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, idioma]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("ai-assistant", {
        body: { message: userMsg, idioma, personalidade, modo: "pergunta" },
      });

      const reply = res.data?.reply || (idioma === "en-US" ? "Sorry, I couldn't process your request." : "Desculpe, não consegui processar sua solicitação.");
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      const errMsg = idioma === "en-US" ? "Connection error. Please try again." : "Erro de conexão. Tente novamente.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const personalidadeLabels: Record<Personalidade, string> = {
    executivo: idioma === "en-US" ? "Executive" : "Executivo",
    analista: idioma === "en-US" ? "Analyst" : "Analista",
    amigavel: idioma === "en-US" ? "Friendly" : "Amigável",
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-sm font-orbitron">
              <Sparkles className="h-4 w-4 text-primary" />
              {idioma === "en-US" ? "Smart Assistant" : "Assistente Inteligente"}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) window.speechSynthesis?.cancel(); }}
                title={ttsEnabled ? "Desativar voz" : "Ativar voz"}
              >
                {ttsEnabled ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Settings panel */}
        {showSettings && (
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex flex-wrap gap-3 items-center text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{idioma === "en-US" ? "Language:" : "Idioma:"}</span>
              <Select value={idioma} onValueChange={(v) => setIdioma(v as Idioma)}>
                <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{idioma === "en-US" ? "Style:" : "Estilo:"}</span>
              <Select value={personalidade} onValueChange={(v) => setPersonalidade(v as Personalidade)}>
                <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["executivo", "analista", "amigavel"] as Personalidade[]).map(p => (
                    <SelectItem key={p} value={p}>{personalidadeLabels[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={cn(
                "max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 flex gap-2 shrink-0">
          <Input
            placeholder={idioma === "en-US" ? "Ask me anything..." : "Pergunte qualquer coisa..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
            className="bg-background/50 text-sm"
          />
          <Button size="icon" onClick={sendMessage} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
