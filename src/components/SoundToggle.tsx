import { Volume2, VolumeX } from "lucide-react";
import { useSounds } from "./SoundProvider";

export const SoundToggle = () => {
  const { enabled, setEnabled, play } = useSounds();

  const handleToggle = () => {
    if (!enabled) {
      setEnabled(true);
      setTimeout(() => play("click"), 50);
    } else {
      play("click");
      setTimeout(() => setEnabled(false), 100);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-card border border-border shadow-lg hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:scale-110 active:scale-95"
      aria-label={enabled ? "Desativar sons" : "Ativar sons"}
      title={enabled ? "Desativar sons" : "Ativar sons"}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5 text-primary" />
      ) : (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
};
