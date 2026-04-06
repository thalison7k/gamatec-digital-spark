import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Sparkles, Check, ExternalLink, Rocket, Volume2, VolumeX, AudioLines, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type VozGenero = "masculino" | "feminino";

interface CollectedData {
  tipo?: string;
  empresa?: string;
  objetivo?: string;
  publico?: string;
  estilo?: string;
  cores?: string;
  secoes?: string;
  funcionalidades?: string;
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  options?: string[];
  timestamp?: string;
}

const STEPS = [
  {
    key: "tipo",
    question: "Olá! 👋 Sou o assistente da GamaTec. Vou te ajudar a criar sua solicitação de forma rápida e fácil!\n\nQual o tipo de site você deseja criar?",
    options: ["Landing Page", "Institucional", "E-commerce", "Blog"],
  },
  {
    key: "empresa",
    question: "Ótimo! Qual o nome da sua empresa ou projeto?",
    hint: "Ex: GamaTec, Minha Loja, Studio Maria...",
  },
  {
    key: "objetivo",
    question: "Qual o principal objetivo do site?",
    options: ["Vender produtos/serviços", "Captar clientes/leads", "Divulgar a marca", "Portfólio/apresentação"],
  },
  {
    key: "publico",
    question: "Quem é o público-alvo do seu site?",
    hint: "Ex: Jovens 18-30 anos, empresários, mães empreendedoras...",
  },
  {
    key: "estilo",
    question: "Qual estilo visual você prefere?",
    options: ["Moderno", "Minimalista", "Elegante", "Criativo", "Corporativo"],
  },
  {
    key: "cores",
    question: "Quais cores você gostaria de utilizar no site?",
    hint: "Ex: Azul e branco, tons escuros, cores vibrantes...",
  },
  {
    key: "secoes",
    question: "Quais seções o site deve ter? (pode selecionar várias)",
    options: ["Início", "Sobre", "Serviços", "Portfólio", "Depoimentos", "Contato"],
    multiSelect: true,
  },
  {
    key: "funcionalidades",
    question: "Quais funcionalidades deseja no site? (pode selecionar várias)",
    options: ["WhatsApp flutuante", "Formulário de contato", "Agendamento online", "Blog integrado"],
    multiSelect: true,
  },
] as const;

const WHATSAPP_NUMBER = "5511961442363";

interface AIAssistantChatProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (subject: string, description: string) => void;
}

export default function AIAssistantChat({ open, onClose, onGenerate }: AIAssistantChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [collected, setCollected] = useState<CollectedData>({});
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [vozGenero, setVozGenero] = useState<VozGenero>("masculino");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preload voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handler = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", handler);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", handler);
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, "").replace(/[📌🏢🎯👥🎨📄⚙️✅🎉🚀✓💡]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "pt-BR";
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(v => v.lang.startsWith("pt"));

    let best: SpeechSynthesisVoice | undefined;

    if (vozGenero === "feminino") {
      best = ptVoices.find(v => v.name.toLowerCase().includes("francisca"))
        || ptVoices.find(v => v.name.toLowerCase().includes("maria"))
        || ptVoices.find(v => v.name.toLowerCase().includes("vitoria") || v.name.toLowerCase().includes("vitória"))
        || ptVoices.find(v => v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("brasileiro"))
        || ptVoices.find(v => v.name.toLowerCase().includes("female"))
        || ptVoices[0];
      utterance.rate = 0.95;
      utterance.pitch = 1.15;
    } else {
      best = ptVoices.find(v => v.name.toLowerCase().includes("google") && v.name.toLowerCase().includes("brasileiro"))
        || ptVoices.find(v => v.name.toLowerCase().includes("daniel"))
        || ptVoices.find(v => v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("feminino") && !v.name.toLowerCase().includes("female") && !v.name.toLowerCase().includes("francisca"))
        || ptVoices.find(v => v.name.toLowerCase().includes("male") && !v.name.toLowerCase().includes("female"))
        || ptVoices[1] || ptVoices[0];
      utterance.rate = 0.88;
      utterance.pitch = 0.75;
    }

    if (best) { utterance.voice = best; utterance.lang = best.lang; }
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, vozGenero]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 80);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        const step = STEPS[0];
        setMessages([{ role: "assistant", content: step.question, options: step.options ? [...step.options] : undefined, timestamp: new Date().toISOString() }]);
        setIsTyping(false);
        speak(step.question);
        scrollToBottom();
      }, 800);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setMessages([]);
      setCurrentStep(0);
      setCollected({});
      setInputValue("");
      setIsTyping(false);
      setConfirmed(false);
      setShowSummary(false);
      setMultiSelections([]);
    }
  }, [open]);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  const isMultiSelectStep = () => {
    const step = STEPS[currentStep];
    return "multiSelect" in step && step.multiSelect;
  };

  const advanceStep = (answer: string) => {
    const stepKey = STEPS[currentStep].key as keyof CollectedData;
    const newCollected = { ...collected, [stepKey]: answer };
    setCollected(newCollected);
    setMessages(prev => [...prev, { role: "user", content: answer, timestamp: new Date().toISOString() }]);
    setMultiSelections([]);

    const nextStep = currentStep + 1;

    if (nextStep < STEPS.length) {
      setIsTyping(true);
      setTimeout(() => {
        const step = STEPS[nextStep];
        const opts = "options" in step ? [...step.options] : undefined;
        setMessages(prev => [...prev, { role: "assistant", content: step.question, options: opts, timestamp: new Date().toISOString() }]);
        setCurrentStep(nextStep);
        setIsTyping(false);
        speak(step.question);
        scrollToBottom();
      }, 600);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setShowSummary(true);
        const summary = buildSummaryMessage(newCollected);
        setMessages(prev => [...prev, { role: "assistant", content: summary, timestamp: new Date().toISOString() }]);
        setIsTyping(false);
        speak(summary);
        scrollToBottom();
      }, 800);
    }
  };

  const buildSummaryMessage = (data: CollectedData) => {
    return `✅ Perfeito! Aqui está o resumo da sua solicitação:\n\n📌 **Tipo:** ${data.tipo}\n🏢 **Empresa:** ${data.empresa}\n🎯 **Objetivo:** ${data.objetivo}\n👥 **Público-alvo:** ${data.publico}\n🎨 **Estilo:** ${data.estilo}\n🎨 **Cores:** ${data.cores}\n📄 **Seções:** ${data.secoes}\n⚙️ **Funcionalidades:** ${data.funcionalidades}\n\nDeseja confirmar e enviar a solicitação?`;
  };

  const buildWhatsAppMessage = (data: CollectedData) => {
    return `Olá, gostaria de solicitar a criação de um site.\n\nTipo: ${data.tipo}\nEmpresa: ${data.empresa}\nObjetivo: ${data.objetivo}\nPúblico: ${data.publico}\nEstilo: ${data.estilo}\nCores: ${data.cores}\nSeções: ${data.secoes}\nFuncionalidades: ${data.funcionalidades}`;
  };

  const saveConversation = async () => {
    if (!user || messages.length < 2) return;
    try {
      await supabase.from("chat_conversations").insert([{
        user_id: user.id,
        assistant_type: "request",
        title: `Solicitação - ${collected.tipo || "Site"} - ${collected.empresa || ""}`.trim(),
        messages: JSON.parse(JSON.stringify(messages)) as any,
        metadata: { collected, voz_tipo: vozGenero } as any,
      }]);
      toast({ title: "Conversa salva!", description: "Dados armazenados com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
    const subjectText = `Criação de site - ${collected.tipo} - ${collected.empresa}`;
    const descriptionText = `Criação de site do tipo ${collected.tipo} para a empresa ${collected.empresa}.\n\nObjetivo: ${collected.objetivo}.\nPúblico-alvo: ${collected.publico}.\nEstilo visual: ${collected.estilo}, utilizando as cores ${collected.cores}.\n\nSeções: ${collected.secoes}.\nFuncionalidades: ${collected.funcionalidades}.\n\nO site deve ser:\n- Responsivo (mobile e desktop)\n- Moderno e visualmente atraente\n- Rápido e otimizado\n- Focado em conversão`;

    const successMsg = "Solicitação enviada com sucesso! Nossa equipe da GamaTec entrará em contato em breve.";
    setMessages(prev => [...prev, { role: "assistant", content: "🎉 **Solicitação enviada com sucesso!** 🚀\n\nNossa equipe da GamaTec entrará em contato em breve.\n\nVocê também pode enviar pelo WhatsApp para agilizar o atendimento!", timestamp: new Date().toISOString() }]);
    speak(successMsg);
    onGenerate(subjectText, descriptionText);

    setTimeout(() => {
      const whatsappMsg = encodeURIComponent(buildWhatsAppMessage(collected));
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`, "_blank");
    }, 2500);
  };

  const handleSend = () => {
    if (isTyping || showSummary) return;
    if (isMultiSelectStep()) {
      const answer = multiSelections.length > 0 ? multiSelections.join(", ") : inputValue.trim();
      if (!answer) return;
      advanceStep(answer);
      setInputValue("");
      return;
    }
    if (!inputValue.trim()) return;
    advanceStep(inputValue.trim());
    setInputValue("");
  };

  const handleOptionClick = (option: string) => {
    if (isTyping || showSummary) return;
    if (isMultiSelectStep()) {
      setMultiSelections(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
      return;
    }
    advanceStep(option);
  };

  const handleWhatsAppClick = () => {
    const whatsappMsg = encodeURIComponent(buildWhatsAppMessage(collected));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`, "_blank");
  };

  // Progress indicator
  const progress = Math.round(((currentStep) / STEPS.length) * 100);

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === "user";
    const isLastAssistant = !isUser && index === messages.length - 1;

    return (
      <div key={index} className={cn("flex gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mt-1 ring-1 ring-primary/10">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
        )}
        <div className={cn(
          "max-w-[88%] sm:max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted/80 text-foreground rounded-bl-sm border border-border/30"
        )}>
          {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}

          {/* Option buttons */}
          {isLastAssistant && msg.options && !showSummary && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {msg.options.map((opt) => {
                const isSelected = multiSelections.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionClick(opt)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-full border transition-all duration-200 active:scale-95",
                      isSelected
                        ? "border-primary bg-primary/30 text-primary font-medium shadow-sm shadow-primary/10"
                        : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/40"
                    )}
                  >
                    {isSelected && "✓ "}{opt}
                  </button>
                );
              })}
              {isMultiSelectStep() && multiSelections.length > 0 && (
                <button
                  onClick={handleSend}
                  className="px-3 py-1.5 text-xs rounded-full border border-primary bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 active:scale-95"
                >
                  Confirmar seleção →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-1rem)] max-h-[90vh] sm:max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-primary/10">
        {/* Header */}
        <DialogHeader className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/50 shrink-0 bg-gradient-to-r from-primary/5 to-transparent pr-10">
          <div className="flex items-center justify-between gap-1">
            <DialogTitle className="flex items-center gap-2 text-sm font-orbitron min-w-0">
              <div className="relative shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
                {isSpeaking && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              <span className="hidden sm:inline truncate">Assistente IA</span>
              <span className="sm:hidden text-xs truncate">Assistente</span>
            </DialogTitle>
            <div className="flex items-center gap-1 shrink-0">
              {isSpeaking && (
                <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                  <AudioLines className="h-3 w-3 animate-pulse" />
                </div>
              )}
              <Select value={vozGenero} onValueChange={(v) => setVozGenero(v as VozGenero)}>
                <SelectTrigger className="h-7 w-[80px] sm:w-[110px] text-[10px] sm:text-xs rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">♂ JARVIS</SelectItem>
                  <SelectItem value="feminino">♀ FRIDAY</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant={ttsEnabled ? "default" : "outline"}
                className="h-7 gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 rounded-lg transition-all duration-200 active:scale-95"
                onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) { window.speechSynthesis?.cancel(); setIsSpeaking(false); } }}
              >
                {ttsEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                <span className="hidden sm:inline">{ttsEnabled ? "On" : "Off"}</span>
              </Button>
            </div>
          </div>
          {/* Progress bar */}
          {!confirmed && (
            <div className="mt-2">
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${showSummary ? 100 : progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {showSummary ? "Revisão final" : `Etapa ${currentStep + 1} de ${STEPS.length}`}
              </p>
            </div>
          )}
        </DialogHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0 scroll-smooth">
          {messages.map(renderMessage)}

          {isTyping && (
            <div className="flex gap-2 mb-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mt-1 ring-1 ring-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted/80 rounded-2xl rounded-bl-sm px-4 py-3 border border-border/30">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Confirm / Cancel */}
          {showSummary && !confirmed && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4 animate-in fade-in duration-300">
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-primary to-cyan-500 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 active:scale-95 rounded-xl"
                onClick={handleConfirm}
              >
                <Check className="h-3.5 w-3.5" /> Confirmar e Enviar
              </Button>
              <Button size="sm" variant="outline" onClick={onClose} className="rounded-xl active:scale-95 transition-all duration-200">
                Cancelar
              </Button>
            </div>
          )}

          {/* Success */}
          {confirmed && (
            <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in zoom-in duration-500">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center ring-2 ring-green-400/20">
                <Rocket className="h-7 w-7 text-green-400" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-green-400 border-green-500/30 hover:bg-green-500/10 rounded-xl active:scale-95 transition-all"
                  onClick={handleWhatsAppClick}
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Enviar pelo WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs text-muted-foreground rounded-xl active:scale-95"
                  onClick={saveConversation}
                >
                  <Save className="h-3 w-3" /> Salvar conversa
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={onClose}>
                Fechar
              </Button>
            </div>
          )}
        </div>

        {/* Input */}
        {!showSummary && (
          <div className="border-t border-border/50 p-2.5 sm:p-3 flex gap-2 shrink-0 bg-background/80 backdrop-blur-sm">
            <Input
              ref={inputRef}
              placeholder={
                STEPS[currentStep] && "hint" in STEPS[currentStep]
                  ? (STEPS[currentStep] as any).hint
                  : "Digite sua resposta..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
              className="bg-muted/30 text-sm rounded-xl border-border/50 focus-visible:ring-primary/30 h-10"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={(!inputValue.trim() && multiSelections.length === 0) || isTyping}
              className="h-10 w-10 rounded-xl shrink-0 transition-all duration-200 active:scale-90 bg-gradient-to-br from-primary to-cyan-500 hover:shadow-lg hover:shadow-primary/25"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
