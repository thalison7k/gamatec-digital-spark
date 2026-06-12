import { usePerformance } from "@/hooks/usePerformance";
import { Activity } from "lucide-react";

export const FpsCounter = () => {
  const { showFpsCounter, currentFps } = usePerformance();
  if (!showFpsCounter) return null;

  const color =
    currentFps >= 55 ? "text-green-400 border-green-400/40"
    : currentFps >= 30 ? "text-yellow-400 border-yellow-400/40"
    : "text-red-400 border-red-400/40";

  return (
    <div
      className={`fixed top-20 left-4 z-[40] flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/70 backdrop-blur-md border ${color} font-mono text-xs font-bold shadow-lg pointer-events-none select-none`}
      aria-hidden="true"
    >
      <Activity className="h-3 w-3" />
      {currentFps} FPS
    </div>
  );
};
