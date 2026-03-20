import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, X, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  },
  {
    key: "objetivo",
    question: "Qual o principal objetivo do site?",
    options: ["Vender produtos/serviços", "Captar clientes/leads", "Divulgar a marca", "Portfólio/apresentação"],
  },
  {
    key: "publico",
    question: "Quem é o público-alvo do seu site?",
  },
  {
    key: "estilo",
    question: "Qual estilo visual você prefere?",
    options: ["Moderno", "Minimalista", "Elegante", "Criativo", "Corporativo"],
  },
  {
    key: "cores",
    question: "Quais cores você gostaria de utilizar no site?",
  },
  {
    key: "secoes",
    question: "Quais seções o site deve ter?",
    options: ["Início", "Sobre", "Serviços", "Portfólio", "Depoimentos", "Contato"],
  },
  {
    key: "funcionalidades",
    question: "Quais funcionalidades deseja no site?",
    options: ["WhatsApp flutuante", "Formulário de contato", "Agendamento online", "Blog integrado"],
  },
] as const;

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  // Initialize chat
  useEffect(() => {
    if (open && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        const step = STEPS[0];
        setMessages([{ role: "assistant", content: step.question, options: step.options ? [...step.options] : undefined }]);
        setIsTyping(false);
        scrollToBottom();
      }, 800);
    }
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setCurrentStep(0);
      setCollected({});
      setInputValue("");
      setIsTyping(false);
      setConfirmed(false);
      setShowSummary(false);
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const advanceStep = (answer: string) => {
    const stepKey = STEPS[currentStep].key as keyof CollectedData;
    const newCollected = { ...collected, [stepKey]: answer };
    setCollected(newCollected);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: answer }]);

    const nextStep = currentStep + 1;

    if (nextStep < STEPS.length) {
      setIsTyping(true);
      setTimeout(() => {
        const step = STEPS[nextStep];
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: step.question, options: step.options ? [...step.options] : undefined },
        ]);
        setCurrentStep(nextStep);
        setIsTyping(false);
        scrollToBottom();
      }, 600);
    } else {
      // Show summary
      setIsTyping(true);
      setTimeout(() => {
        setShowSummary(true);
        const summary = buildSummaryMessage(newCollected);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: summary },
        ]);
        setIsTyping(false);
        scrollToBottom();
      }, 800);
    }
  };

  const buildSummaryMessage = (data: CollectedData) => {
    return `✅ Perfeito! Aqui está o resumo da sua solicitação:\n\n📌 **Tipo:** ${data.tipo}\n🏢 **Empresa:** ${data.empresa}\n🎯 **Objetivo:** ${data.objetivo}\n👥 **Público-alvo:** ${data.publico}\n🎨 **Estilo:** ${data.estilo}\n🎨 **Cores:** ${data.cores}\n📄 **Seções:** ${data.secoes}\n⚙️ **Funcionalidades:** ${data.funcionalidades}\n\nDeseja confirmar e gerar a solicitação?`;
  };

  const handleConfirm = () => {
    setConfirmed(true);

    const subjectText = `Criação de site - ${collected.tipo} - ${collected.empresa}`;
    const descriptionText = `Criação de site do tipo ${collected.tipo} para a empresa ${collected.empresa}.\nObjetivo: ${collected.objetivo}.\nPúblico-alvo: ${collected.publico}.\nEstilo: ${collected.estilo}, cores ${collected.cores}.\nSeções: ${collected.secoes}.\nFuncionalidades: ${collected.funcionalidades}.\nO site deve ser moderno, responsivo e otimizado para conversão.`;

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "🎉 Sua solicitação foi gerada com sucesso! Revise os campos preenchidos e clique em **Criar Solicitação**." },
    ]);

    setTimeout(() => {
      onGenerate(subjectText, descriptionText);
      onClose();
    }, 2000);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isTyping || showSummary) return;
    advanceStep(inputValue.trim());
    setInputValue("");
  };

  const handleOptionClick = (option: string) => {
    if (isTyping || showSummary) return;
    // For multi-select steps (secoes, funcionalidades), allow picking or typing
    advanceStep(option);
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === "user";
    return (
      <div key={index} className={cn("flex gap-2 mb-3", isUser ? "justify-end" : "justify-start")}>
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
          {!isUser && msg.options && index === messages.length - 1 && !showSummary && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {msg.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  className="px-3 py-1 text-xs rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {opt}
                </button>
              ))}
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
          <DialogTitle className="flex items-center gap-2 text-sm font-orbitron">
            <Sparkles className="h-4 w-4 text-primary" />
            Assistente IA
          </DialogTitle>
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

          {/* Confirm / Cancel buttons */}
          {showSummary && !confirmed && (
            <div className="flex gap-2 justify-center mt-3">
              <Button size="sm" className="gap-1.5" onClick={handleConfirm}>
                <Check className="h-3.5 w-3.5" /> Confirmar
              </Button>
              <Button size="sm" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* Input */}
        {!showSummary && (
          <div className="border-t border-border p-3 flex gap-2 shrink-0">
            <Input
              placeholder="Digite sua resposta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
              className="bg-background/50 text-sm"
            />
            <Button size="icon" onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
