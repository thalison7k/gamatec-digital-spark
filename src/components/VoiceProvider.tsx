import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";

type VozTipo = "masculina" | "feminina";

interface VoiceContextType {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  vozTipo: VozTipo;
  setVozTipo: (v: VozTipo) => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export const useVoice = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
};

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(false);
  const [vozTipo, setVozTipo] = useState<VozTipo>("masculina");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text: string) => {
    if (!enabled || !text.trim() || !window.speechSynthesis) return;
    stop();

    timerRef.current = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";

      const voices = window.speechSynthesis.getVoices();
      const filtered = voices.filter((v) => v.lang.startsWith("pt"));

      let best: SpeechSynthesisVoice | undefined;

      if (vozTipo === "feminina") {
        best =
          filtered.find((v) => v.name.toLowerCase().includes("francisca")) ||
          filtered.find((v) => v.name.toLowerCase().includes("maria")) ||
          filtered.find((v) => v.name.toLowerCase().includes("vitoria") || v.name.toLowerCase().includes("vitória")) ||
          filtered.find((v) => v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("brasileiro")) ||
          filtered.find((v) => v.name.toLowerCase().includes("female")) ||
          filtered[0];
        utterance.rate = 0.95;
        utterance.pitch = 1.15;
      } else {
        best =
          filtered.find((v) => v.name.toLowerCase().includes("google") && v.name.toLowerCase().includes("brasileiro")) ||
          filtered.find((v) => v.name.toLowerCase().includes("daniel")) ||
          filtered.find((v) =>
            v.name.toLowerCase().includes("google") &&
            !v.name.toLowerCase().includes("feminino") &&
            !v.name.toLowerCase().includes("female") &&
            !v.name.toLowerCase().includes("francisca")
          ) ||
          filtered.find((v) =>
            v.name.toLowerCase().includes("male") &&
            !v.name.toLowerCase().includes("female")
          ) ||
          filtered[1] || filtered[0];
        utterance.rate = 0.88;
        utterance.pitch = 0.75;
      }

      if (best) {
        utterance.voice = best;
        utterance.lang = best.lang;
      }
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }, 400);
  }, [enabled, vozTipo, stop]);

  // Global event delegation for data-voice attributes
  useEffect(() => {
    if (!enabled) return;

    const handleMouseEnter = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-voice]");
      if (target) {
        const text = target.getAttribute("data-voice");
        if (text) speak(text);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-voice]");
      if (target) stop();
    };

    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
      stop();
    };
  }, [enabled, speak, stop]);

  return (
    <VoiceContext.Provider value={{ enabled, setEnabled, vozTipo, setVozTipo }}>
      {children}
    </VoiceContext.Provider>
  );
};
