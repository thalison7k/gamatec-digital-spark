import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Sparkles, Check, ExternalLink, Rocket, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
}

const STEPS = [
  {
    key: "tipo",
    question: "Olá! 👋 Sou o assistente inteligente da GamaTec. Vou te ajudar a criar sua solicitação de forma rápida e fácil!\n\nQual o tipo de site você deseja criar?",
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
    question: "Quais seções o site deve ter? (pode selecionar ou digitar várias)",
    options: ["Início", "Sobre", "Serviços", "Portfólio", "Depoimentos", "Contato"],
    multiSelect: true,
  },
  {
    key: "funcionalidades",
    question: "Quais funcionalidades deseja no site? (pode selecionar ou digitar várias)",
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [collected, setCollected] = useState<CollectedData>({});
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    const clean = text.replace(/\*\*/g, "").replace(/[📌🏢🎯👥🎨📄⚙️✅🎉🚀✓]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "pt-BR";
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(v => v.lang.startsWith("pt"));
    // JARVIS-style: prefer deep, clear male voices
    const best = ptVoices.find(v => v.name.toLowerCase().includes("google") && v.name.toLowerCase().includes("brasileiro"))
      || ptVoices.find(v => v.name.toLowerCase().includes("google"))
      || ptVoices.find(v => v.name.toLowerCase().includes("daniel"))
      || ptVoices.find(v => v.name.toLowerCase().includes("microsoft"))
      || ptVoices.find(v => v.name.toLowerCase().includes("natural"))
      || ptVoices[0];
    if (best) { utterance.voice = best; utterance.lang = best.lang; }
    // JARVIS voice profile: calm, deep, precise — like an AI butler
    utterance.rate = 0.88;   // Slower, deliberate cadence
    utterance.pitch = 0.75;  // Deep, authoritative tone
    utterance.volume = 1.0;  // Clear and present
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        const step = STEPS[0];
        setMessages([{ role: "assistant", content: step.question, options: step.options ? [...step.options] : undefined }]);
        setIsTyping(false);
        speak(step.question);
        scrollToBottom();
      }, 800);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel();
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const isMultiSelectStep = () => {
    const step = STEPS[currentStep];
    return "multiSelect" in step && step.multiSelect;
  };

  const advanceStep = (answer: string) => {
    const stepKey = STEPS[currentStep].key as keyof CollectedData;
    const newCollected = { ...collected, [stepKey]: answer };
    setCollected(newCollected);
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setMultiSelections([]);

    const nextStep = currentStep + 1;

    if (nextStep < STEPS.length) {
      setIsTyping(true);
      setTimeout(() => {
        const step = STEPS[nextStep];
        const opts = "options" in step ? [...step.options] : undefined;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: step.question, options: opts },
        ]);
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
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: summary },
        ]);
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

  const handleConfirm = () => {
    setConfirmed(true);

    const subjectText = `Criação de site - ${collected.tipo} - ${collected.empresa}`;
    const descriptionText = `Criação de site do tipo ${collected.tipo} para a empresa ${collected.empresa}.\n\nObjetivo: ${collected.objetivo}.\nPúblico-alvo: ${collected.publico}.\nEstilo visual: ${collected.estilo}, utilizando as cores ${collected.cores}.\n\nSeções: ${collected.secoes}.\nFuncionalidades: ${collected.funcionalidades}.\n\nO site deve ser:\n- Responsivo (mobile e desktop)\n- Moderno e visualmente atraente\n- Rápido e otimizado\n- Focado em conversão`;

    const successMsg = "Solicitação enviada com sucesso! Nossa equipe da GamaTec entrará em contato em breve. Você também pode enviar pelo WhatsApp para agilizar o atendimento!";
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "🎉 **Solicitação enviada com sucesso!** 🚀\n\nNossa equipe da GamaTec entrará em contato em breve.\n\nVocê também pode enviar pelo WhatsApp para agilizar o atendimento!" },
    ]);
    speak(successMsg);

    onGenerate(subjectText, descriptionText);

    // Open WhatsApp after a short delay
    setTimeout(() => {
      const whatsappMsg = encodeURIComponent(buildWhatsAppMessage(collected));
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`, "_blank");
    }, 2500);
  };

  const handleSend = () => {
    if (isTyping || showSummary) return;

    if (isMultiSelectStep()) {
      const answer = multiSelections.length > 0
        ? multiSelections.join(", ")
        : inputValue.trim();
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
      setMultiSelections((prev) =>
        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
      );
      return;
    }

    advanceStep(option);
  };

  const handleWhatsAppClick = () => {
    const whatsappMsg = encodeURIComponent(buildWhatsAppMessage(collected));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`, "_blank");
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === "user";
    const isLastAssistant = !isUser && index === messages.length - 1;

    return (
      <div key={index} className={cn("flex gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <div className="shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mt-1">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className={cn(
          "max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
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
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      isSelected
                        ? "border-primary bg-primary/30 text-primary font-medium"
                        : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    {isSelected && "✓ "}{opt}
                  </button>
                );
              })}
              {isMultiSelectStep() && multiSelections.length > 0 && (
                <button
                  onClick={handleSend}
                  className="px-3 py-1 text-xs rounded-full border border-primary bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
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
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-sm font-orbitron">
              <Sparkles className="h-4 w-4 text-primary" />
              Assistente IA
            </DialogTitle>
            <Button
              size="sm"
              variant={ttsEnabled ? "default" : "outline"}
              className="h-7 gap-1.5 text-xs px-2.5"
              onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) window.speechSynthesis?.cancel(); }}
            >
              {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {ttsEnabled ? "Voz On" : "Voz Off"}
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 min-h-0">
          {messages.map(renderMessage)}

          {isTyping && (
            <div className="flex gap-2 mb-3">
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

          {/* Confirm / Cancel / WhatsApp */}
          {showSummary && !confirmed && (
            <div className="flex gap-2 justify-center mt-3">
              <Button size="sm" className="gap-1.5" onClick={handleConfirm}>
                <Check className="h-3.5 w-3.5" /> Confirmar e Enviar
              </Button>
              <Button size="sm" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          )}

          {/* Success actions */}
          {confirmed && (
            <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in duration-500">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-green-400" />
              </div>
              <Button size="sm" variant="outline" className="gap-2 text-green-400 border-green-500/30 hover:bg-green-500/10" onClick={handleWhatsAppClick}>
                <ExternalLink className="h-3.5 w-3.5" /> Enviar pelo WhatsApp
              </Button>
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={onClose}>
                Fechar
              </Button>
            </div>
          )}
        </div>

        {/* Input */}
        {!showSummary && (
          <div className="border-t border-border p-3 flex gap-2 shrink-0">
            <Input
              placeholder={
                STEPS[currentStep] && "hint" in STEPS[currentStep]
                  ? (STEPS[currentStep] as any).hint
                  : "Digite sua resposta..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
              className="bg-background/50 text-sm"
            />
            <Button size="icon" onClick={handleSend} disabled={(!inputValue.trim() && multiSelections.length === 0) || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
