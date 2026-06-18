import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Sparkles, Youtube, Instagram, MessageCircle, LogOut, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ThemeLogo } from "@/components/ThemeLogo";
import { useAuth } from "@/hooks/useAuth";
import { usePerformance } from "@/hooks/usePerformance";

const FloatingLines = lazy(() => import("@/components/FloatingLines"));
import { useToast } from "@/hooks/use-toast";
import { useSounds } from "@/components/SoundProvider";

export const Hero = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { play } = useSounds();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { floatingLinesEnabled } = usePerformance();

  const scrollToPricing = () => {
    play("whoosh");
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logout realizado", description: "Até logo!" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary rounded-full blur-[80px] md:blur-[128px] animate-float-gentle" />
          <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-accent rounded-full blur-[80px] md:blur-[128px] animate-float-gentle" style={{ animationDelay: "2s" }} />
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10 animate-rotate-glow" />
        </div>
      </div>

      {/* WebGL Floating Lines */}
      {!isMobile && floatingLinesEnabled &&
      <Suspense fallback={null}>
          <FloatingLines
          linesGradient={["#00bfff", "#8b5cf6", "#00bfff"]}
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={3}
          lineDistance={5}
          animationSpeed={0.8}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
          parallaxStrength={0.15} />
        
        </Suspense>
      }

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* ===== Bloco do Logo ===== */}
          {/* Empilha em coluna no mobile e em linha no desktop, evitando o "círculo gigante" */}
          <div className="logo-container flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 scroll-reveal-scale visible" style={{ transitionDelay: "0.1s" }}>
            <ThemeLogo
              alt="GamaTec.IA Logo"
              className="logo-image w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain rounded-full ring-2 ring-primary/40 shadow-[0_0_25px_hsl(var(--primary)/0.35)]"
            />
            <span
              className="logo-text text-3xl sm:text-4xl md:text-5xl font-orbitron font-bold glow-text text-white"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.85), 0 0 24px hsl(var(--primary) / 0.6)' }}
            >
              GamaTec.IA
            </span>
          </div>

          {/* ===== Título principal ===== */}
          {/* Tamanho reduzido no mobile para evitar quebra com o widget VLibras */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-orbitron font-black leading-tight reveal-3d-flip visible" style={{ transitionDelay: "0.3s" }}>
            <span className="gradient-text">Sites Profissionais</span>
            <br />
            <span className="text-foreground">Rápidos &amp; Acessíveis</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto scroll-reveal visible" style={{ transitionDelay: "0.5s" }}>
            Desenvolvimento web de qualidade para pequenos negócios que querem crescer com presença digital marcante.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 stagger-children visible">
            {[
            { icon: Zap, label: "Entrega Rápida" },
            { icon: Shield, label: "Qualidade Garantida" },
            { icon: Sparkles, label: "Tecnologia Moderna" }].
            map(({ icon: Icon, label }, i) =>
            <div key={i} className="flex items-center gap-2 text-primary icon-bounce">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <div className="scroll-reveal-left visible" style={{ transitionDelay: "0.9s" }}>
              <Button
                size="lg"
                className="text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-border hover-lift pulse-ring"
                onClick={scrollToPricing}
                onMouseEnter={() => play("hover")}>
                Ver Planos
              </Button>
            </div>
            <div className="scroll-reveal-right visible" style={{ transitionDelay: "1.05s" }}>
              <Button
                size="lg"
                variant="outline"
                className="text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center gap-2"
                onClick={() => {play("click");window.open('https://wa.me/5511961442363', '_blank');}}
                onMouseEnter={() => play("hover")}>
                <MessageCircle className="w-5 h-5" />
                Entrar em Contato
              </Button>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-4 stagger-children visible" style={{ transitionDelay: "1.2s" }}>
            <button onClick={() => window.open('https://www.instagram.com/reel/DRlEVL5DME_/?igsh=MXdxemZjaHA3cnRwMA==', '_blank')}
            className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125 icon-bounce" aria-label="Instagram">
              <Instagram className="w-6 h-6" />
            </button>
            <button onClick={() => window.open('https://www.youtube.com/@GamaTec-b6k', '_blank')}
            className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125 icon-bounce" aria-label="YouTube">
              <Youtube className="w-6 h-6" />
            </button>
          </div>

          {/* Como Funciona Link */}
          <div className="pt-6 scroll-reveal visible" style={{ transitionDelay: "1.4s" }}>
            <button
              onClick={() => {play("whoosh");navigate("/como-funciona");}}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 font-orbitron">
              <BookOpen className="w-4 h-4" />
              Como a GamaTec.IA Funciona
            </button>
          </div>
        </div>
      </div>
    </section>);

};