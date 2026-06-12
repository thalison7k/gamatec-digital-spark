import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";

export type ResolutionScale = 0.5 | 0.75 | 1 | 1.1 | 1.25;
export type FpsCap = 30 | 45 | 60 | 0; // 0 = ilimitado

interface PerformanceContextType {
  resolution: ResolutionScale;
  setResolution: (v: ResolutionScale) => void;
  fpsCap: FpsCap;
  setFpsCap: (v: FpsCap) => void;
  showFpsCounter: boolean;
  setShowFpsCounter: (v: boolean) => void;
  currentFps: number;
  /** Modo performance manual (toggle do usuário) */
  performanceModeManual: boolean;
  setPerformanceModeManual: (v: boolean) => void;
  /** Flag final: manual OU derivado de resolução baixa / FPS limitado */
  performanceMode: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const ctx = useContext(PerformanceContext);
  if (!ctx) throw new Error("usePerformance deve estar dentro de PerformanceProvider");
  return ctx;
};

// Guarda o RAF original para podermos restaurar quando ilimitado
const originalRAF: typeof window.requestAnimationFrame =
  typeof window !== "undefined" ? window.requestAnimationFrame.bind(window) : (() => 0) as any;

export const PerformanceProvider = ({ children }: { children: ReactNode }) => {
  const [resolution, setResolutionState] = useState<ResolutionScale>(() => {
    if (typeof window === "undefined") return 1;
    const v = parseFloat(localStorage.getItem("gamatec-resolution") || "1");
    return ([0.5, 0.75, 1, 1.1, 1.25].includes(v) ? v : 1) as ResolutionScale;
  });

  const [fpsCap, setFpsCapState] = useState<FpsCap>(() => {
    if (typeof window === "undefined") return 0;
    const v = parseInt(localStorage.getItem("gamatec-fps-cap") || "0", 10);
    return ([0, 30, 45, 60].includes(v) ? v : 0) as FpsCap;
  });

  const [showFpsCounter, setShowFpsCounterState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("gamatec-show-fps") === "true";
  });

  const [currentFps, setCurrentFps] = useState(0);

  // Aplica resolução (zoom). Usa CSS zoom (suportado em todos navegadores modernos).
  useEffect(() => {
    (document.documentElement.style as any).zoom = String(resolution);
    localStorage.setItem("gamatec-resolution", String(resolution));
  }, [resolution]);

  // Aplica cap de FPS sobrescrevendo requestAnimationFrame
  useEffect(() => {
    localStorage.setItem("gamatec-fps-cap", String(fpsCap));
    if (!fpsCap) {
      window.requestAnimationFrame = originalRAF;
      return;
    }
    const interval = 1000 / fpsCap;
    let last = 0;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      return originalRAF((t: number) => {
        if (t - last >= interval) {
          last = t;
          cb(t);
        } else {
          window.requestAnimationFrame(cb);
        }
      });
    }) as typeof window.requestAnimationFrame;
    return () => {
      window.requestAnimationFrame = originalRAF;
    };
  }, [fpsCap]);

  // Persiste flag do contador
  useEffect(() => {
    localStorage.setItem("gamatec-show-fps", String(showFpsCounter));
  }, [showFpsCounter]);

  // Medidor de FPS (só roda quando contador está visível)
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!showFpsCounter) {
      setCurrentFps(0);
      return;
    }
    let frames = 0;
    let lastTime = performance.now();
    let running = true;
    const loop = () => {
      if (!running) return;
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setCurrentFps(Math.round((frames * 1000) / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }
      rafRef.current = originalRAF(loop);
    };
    rafRef.current = originalRAF(loop);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showFpsCounter]);

  return (
    <PerformanceContext.Provider
      value={{
        resolution,
        setResolution: setResolutionState,
        fpsCap,
        setFpsCap: setFpsCapState,
        showFpsCounter,
        setShowFpsCounter: setShowFpsCounterState,
        currentFps,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};
