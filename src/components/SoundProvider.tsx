import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface SoundContextType {
  play: (sound: "click" | "hover" | "success" | "error" | "whoosh" | "ambient") => void;
  stop: (sound: "click" | "hover" | "success" | "error" | "whoosh" | "ambient") => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSounds = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSounds must be used within SoundProvider");
  return ctx;
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(true);
  const { play, stop, toggle } = useSoundEffects();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  // Lazy: cria o áudio só na primeira interação (evita baixar ~3MB antes do FCP)
  useEffect(() => {
    const ensureAudio = () => {
      if (audioRef.current) return audioRef.current;
      const audio = new Audio();
      audio.preload = "none";
      audio.loop = true;
      audio.volume = 0.15;
      audio.src = "/audio/ambient-music.mp3";
      audioRef.current = audio;
      return audio;
    };

    const startMusic = () => {
      if (hasInteracted.current) return;
      hasInteracted.current = true;
      const audio = ensureAudio();
      if (enabled) audio.play().catch(() => {});
    };

    window.addEventListener("click", startMusic);
    window.addEventListener("touchstart", startMusic);
    window.addEventListener("keydown", startMusic);

    return () => {
      window.removeEventListener("click", startMusic);
      window.removeEventListener("touchstart", startMusic);
      window.removeEventListener("keydown", startMusic);
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [enabled]);

  // Reage ao toggle on/off
  useEffect(() => {
    toggle(enabled);
    const audio = audioRef.current;
    if (!audio) return;
    if (enabled && hasInteracted.current) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [enabled, toggle]);

  return (
    <SoundContext.Provider value={{ play, stop, enabled, setEnabled }}>
      {children}
    </SoundContext.Provider>
  );
};
