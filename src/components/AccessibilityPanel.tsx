import { useState, useEffect, useRef } from "react";
import { Accessibility, Plus, Minus, RotateCcw, Contrast, Type, X, Languages } from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useSounds } from "@/components/SoundProvider";

export const AccessibilityPanel = () => {
  const [open, setOpen] = useState(false);
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize, highContrast, toggleHighContrast } = useAccessibility();
  const { play } = useSounds();

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { play("click"); setOpen(!open); }}
        className="fixed bottom-4 left-4 z-[60] p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
        aria-label="Abrir painel de acessibilidade"
        title="Acessibilidade"
      >
        <Accessibility className="w-5 h-5" />
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Painel de Acessibilidade"
            className="fixed bottom-20 left-4 z-[70] w-72 bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-orbitron text-sm font-bold text-foreground flex items-center gap-2">
                <Accessibility className="h-4 w-4 text-primary" />
                Acessibilidade
              </h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Fechar painel">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Font size */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" />
                Tamanho da Fonte: {fontSize}%
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { play("click"); decreaseFontSize(); }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                  aria-label="Diminuir fonte"
                >
                  <Minus className="h-3.5 w-3.5" /> A-
                </button>
                <button
                  onClick={() => { play("click"); resetFontSize(); }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                  aria-label="Fonte padrão"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => { play("click"); increaseFontSize(); }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                  aria-label="Aumentar fonte"
                >
                  <Plus className="h-3.5 w-3.5" /> A+
                </button>
              </div>
            </div>

            {/* High contrast */}
            <button
              onClick={() => { play("click"); toggleHighContrast(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                highContrast
                  ? "bg-foreground text-background font-medium"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              aria-pressed={highContrast}
            >
              <Contrast className="h-4 w-4" />
              {highContrast ? "Alto Contraste: Ativo" : "Ativar Alto Contraste"}
            </button>

            {/* Translation */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" />
                Traduzir página
              </p>
              <div id="google_translate_element" className="translate-widget rounded-lg overflow-hidden" />
            </div>

            {/* VLibras note */}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              🤟 O widget <strong>VLibras</strong> está disponível no canto inferior direito para tradução em Libras.
            </p>
          </div>
        </>
      )}
    </>
  );
};
