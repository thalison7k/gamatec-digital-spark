import { useState, useEffect, useCallback } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import gamatecLogo from "@/assets/gamatec-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "gamatec_pwa_dismissed";
const INSTALL_DELAY_MS = 8000;

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // User previously dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Re-show after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing the prompt
      setTimeout(() => setShow(true), INSTALL_DELAY_MS);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setShow(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
    setInstalling(false);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (isInstalled || !show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-500 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl shadow-primary/10 p-4 backdrop-blur-xl">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          {/* Logo */}
          <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <img src={gamatecLogo} alt="GamaTec" className="h-8 w-8 object-contain" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              Instalar GamaTec
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Acesse rápido direto da tela inicial do seu dispositivo.
            </p>

            <Button
              onClick={handleInstall}
              disabled={installing}
              size="sm"
              className="mt-2.5 w-full gap-2 rounded-xl font-semibold text-xs h-9"
            >
              {installing ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {installing ? "Instalando..." : "Baixar GamaTec"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
