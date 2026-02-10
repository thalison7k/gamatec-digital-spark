import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

  useEffect(() => {
    toggle(enabled);
  }, [enabled, toggle]);

  return (
    <SoundContext.Provider value={{ play, stop, enabled, setEnabled }}>
      {children}
    </SoundContext.Provider>
  );
};
