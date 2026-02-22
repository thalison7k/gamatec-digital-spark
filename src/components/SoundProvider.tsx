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

  // Create audio element for background music
  useEffect(() => {
    const audio = new Audio("/audio/ambient-music.mp3");
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle play/pause based on enabled state
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

  // Start music on first user interaction
  useEffect(() => {
    const startMusic = () => {
      if (hasInteracted.current) return;
      hasInteracted.current = true;
      const audio = audioRef.current;
      if (audio && enabled) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener("click", startMusic, { once: false });
    window.addEventListener("touchstart", startMusic, { once: false });
    window.addEventListener("keydown", startMusic, { once: false });

    return () => {
      window.removeEventListener("click", startMusic);
      window.removeEventListener("touchstart", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
  }, [enabled]);

  return (
    <SoundContext.Provider value={{ play, stop, enabled, setEnabled }}>
      {children}
    </SoundContext.Provider>
  );
};
