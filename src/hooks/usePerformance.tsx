import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";

export type ResolutionScale = 0.5 | 0.75 | 1 | 1.1 | 1.25;
export type FpsCap = 30 | 45 | 60 | 0; // 0 = ilimitado

export interface HardwareTier {
  tier: "low" | "mid" | "high";
  cores: number;
  memoryGB: number | null;
  isMobile: boolean;
  saveData: boolean;
  reason: string;
}

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
  /** Info do hardware detectado */
  hardware: HardwareTier;
  /** Aplica preset ideal baseado no hardware do usuário */
  applyAutoTune: () => void;
  autoTuned: boolean;
  /** Liga/desliga o efeito WebGL de Linhas Flutuantes (background interativo) */
  floatingLinesEnabled: boolean;
  setFloatingLinesEnabled: (v: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const ctx = useContext(PerformanceContext);
  if (!ctx) throw new Error("usePerformance deve estar dentro de PerformanceProvider");
  return ctx;
};

function detectHardware(): HardwareTier {
  if (typeof window === "undefined") {
    return { tier: "mid", cores: 4, memoryGB: null, isMobile: false, saveData: false, reason: "ssr" };
  }
  const cores = navigator.hardwareConcurrency || 4;
  const memoryGB = (navigator as any).deviceMemory ?? null;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768;
  const conn = (navigator as any).connection;
  const saveData = !!conn?.saveData;
  const slowNet = conn?.effectiveType && /2g|slow-2g|3g/.test(conn.effectiveType);

  let tier: "low" | "mid" | "high" = "mid";
  const reasons: string[] = [];

  if (saveData || slowNet) { tier = "low"; reasons.push("rede limitada"); }
  else if (isMobile && (cores <= 4 || (memoryGB !== null && memoryGB <= 3))) {
    tier = "low"; reasons.push("mobile modesto");
  } else if (cores >= 8 && (memoryGB === null || memoryGB >= 8) && !isMobile) {
    tier = "high"; reasons.push("desktop potente");
  } else if (cores <= 2 || (memoryGB !== null && memoryGB <= 2)) {
    tier = "low"; reasons.push("hardware limitado");
  }

  return { tier, cores, memoryGB, isMobile, saveData, reason: reasons.join(", ") || "padrão" };
}

function presetForTier(tier: "low" | "mid" | "high"): { resolution: ResolutionScale; fpsCap: FpsCap; perfMode: boolean } {
  switch (tier) {
    case "low":  return { resolution: 0.75, fpsCap: 30, perfMode: true };
    case "mid":  return { resolution: 1,    fpsCap: 60, perfMode: false };
    case "high": return { resolution: 1,    fpsCap: 0,  perfMode: false };
  }
}




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

  const [performanceModeManual, setPerformanceModeManual] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("gamatec-perf-mode") === "true";
  });

  // Modo performance derivado: liga automaticamente se resolução baixa ou FPS limitado <= 45
  const performanceMode =
    performanceModeManual || resolution < 1 || (fpsCap !== 0 && fpsCap <= 45);

  // Aplica classe global no <html> para CSS desabilitar efeitos pesados
  useEffect(() => {
    document.documentElement.classList.toggle("perf-mode", performanceMode);
  }, [performanceMode]);

  useEffect(() => {
    localStorage.setItem("gamatec-perf-mode", String(performanceModeManual));
  }, [performanceModeManual]);

  // Persiste preferência de resolução. Não aplicamos CSS `zoom` no <html> porque isso
  // quebra o posicionamento dos portais do Radix (DropdownMenu, Popover, Tooltip, etc.)
  // e faz menus aparecerem fora da tela / atrás de elementos. A escala de resolução
  // é usada apenas pelo WebGL (FloatingLines) para reduzir custo de GPU.
  useEffect(() => {
    (document.documentElement.style as any).zoom = "";
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

  // Hardware detectado (memoizado uma vez)
  const hardwareRef = useRef<HardwareTier | null>(null);
  if (!hardwareRef.current) hardwareRef.current = detectHardware();
  const hardware = hardwareRef.current;

  const [autoTuned, setAutoTuned] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("gamatec-auto-tuned") === "true";
  });

  const [floatingLinesEnabled, setFloatingLinesEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("gamatec-floating-lines");
    return v === null ? true : v === "true";
  });
  useEffect(() => {
    localStorage.setItem("gamatec-floating-lines", String(floatingLinesEnabled));
  }, [floatingLinesEnabled]);

  const applyAutoTune = useCallback(() => {
    const preset = presetForTier(hardware.tier);
    setResolutionState(preset.resolution);
    setFpsCapState(preset.fpsCap);
    setPerformanceModeManual(preset.perfMode);
    setAutoTuned(true);
    localStorage.setItem("gamatec-auto-tuned", "true");
  }, [hardware.tier]);

  // Auto-tune na primeira visita (sem nenhuma preferência salva)
  useEffect(() => {
    const hasAnyPref =
      localStorage.getItem("gamatec-resolution") ||
      localStorage.getItem("gamatec-fps-cap") ||
      localStorage.getItem("gamatec-perf-mode") ||
      localStorage.getItem("gamatec-auto-tuned");
    if (!hasAnyPref && hardware.tier !== "mid") {
      applyAutoTune();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        performanceModeManual,
        setPerformanceModeManual,
        performanceMode,
        hardware,
        applyAutoTune,
        autoTuned,
        floatingLinesEnabled,
        setFloatingLinesEnabled: setFloatingLinesEnabledState,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};
