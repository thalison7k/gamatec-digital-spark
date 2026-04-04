import { useCallback, useRef, useEffect } from "react";

type VozTipo = "masculina" | "feminina";

interface HoverSpeechOptions {
  enabled: boolean;
  idioma?: "pt-BR" | "en-US";
  vozTipo?: VozTipo;
  delay?: number;
}

export function useHoverSpeech({
  enabled,
  idioma = "pt-BR",
  vozTipo = "masculina",
  delay = 400,
}: HoverSpeechOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !text.trim() || !window.speechSynthesis) return;
      stop();

      timerRef.current = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = idioma;

        const voices = window.speechSynthesis.getVoices();
        const langPrefix = idioma.split("-")[0];
        const filtered = voices.filter((v) => v.lang.startsWith(langPrefix));

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
          utterance.pitch = 1.1;
        } else {
          best =
            filtered.find((v) => v.name.toLowerCase().includes("google") && v.name.toLowerCase().includes("brasileiro")) ||
            filtered.find((v) => v.name.toLowerCase().includes("daniel")) ||
            filtered.find((v) => v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("feminino") && !v.name.toLowerCase().includes("female")) ||
            filtered.find((v) => v.name.toLowerCase().includes("male") && !v.name.toLowerCase().includes("female")) ||
            filtered[1] || filtered[0];
          utterance.rate = 0.9;
          utterance.pitch = 0.8;
        }

        if (best) {
          utterance.voice = best;
          utterance.lang = best.lang;
        }
        utterance.volume = 1.0;

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, delay);
    },
    [enabled, idioma, vozTipo, delay, stop]
  );

  const hoverHandlers = useCallback(
    (text: string) => ({
      onMouseEnter: () => speak(text),
      onMouseLeave: stop,
    }),
    [speak, stop]
  );

  return { speak, stop, hoverHandlers };
}
