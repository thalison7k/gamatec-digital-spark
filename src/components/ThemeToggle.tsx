import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useSounds } from "./SoundProvider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { play } = useSounds();

  return (
    <button
      onClick={() => { play("click"); toggleTheme(); }}
      className="fixed bottom-4 right-16 z-50 p-3 rounded-full bg-card border border-border shadow-lg hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:scale-110 active:scale-95"
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      title={theme === "dark" ? "Tema Claro" : "Tema Escuro"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-primary" />
      ) : (
        <Moon className="w-5 h-5 text-primary" />
      )}
    </button>
  );
};
