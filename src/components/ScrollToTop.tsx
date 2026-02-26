import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-card border border-border shadow-lg hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:scale-110 active:scale-95"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ArrowUp className="w-5 h-5 text-primary" />
    </button>
  );
};
