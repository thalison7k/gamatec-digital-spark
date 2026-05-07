import { MessageCircle } from "lucide-react";

export const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/5511961442363?text=Olá! Gostaria de solicitar um orçamento."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-50 flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-medium px-3.5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 text-xs"
      aria-label="Solicitar orçamento pelo WhatsApp"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Orçamento</span>
    </a>
  );
};
