import { useTheme } from "@/hooks/useTheme";
import logoDark from "@/assets/gamatec-logo.png";
import logoLight from "@/assets/gamatec-logo-light.png";

interface ThemeLogoProps {
  alt?: string;
  className?: string;
}

export function ThemeLogo({ alt = "GamaTec.IA", className = "" }: ThemeLogoProps) {
  const { theme } = useTheme();
  const src = theme === "light" ? logoLight : logoDark;

  return <img src={src} alt={alt} className={className} />;
}
