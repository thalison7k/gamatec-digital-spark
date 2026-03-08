import { MessageCircle } from "lucide-react";

export const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/5511961442363?text=Olá! Gostaria de solicitar um orçamento."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold px-5 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-float-gentle"
      aria-label="Solicitar orçamento pelo WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline text-sm">Solicitar Orçamento</span>
    </a>
  );
};
