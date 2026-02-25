import { Button } from "@/components/ui/button";
import { Zap, Shield, Sparkles, Youtube, Instagram, MessageCircle, LogOut, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/gamatec-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSounds } from "@/components/SoundProvider";

export const Hero = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { play } = useSounds();
  const navigate = useNavigate();

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
        {/* Floating particles - hidden on mobile for performance */}
        <div className="hidden md:block">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="particle bg-primary/30"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                bottom: '-10px',
                animationDuration: `${Math.random() * 8 + 6}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="logo-container inline-flex items-center gap-4 mb-4 opacity-0 animate-hero-entrance" style={{ animationDelay: "0.1s" }}>
            <img src={logo} alt="GamaTec.IA Logo" className="logo-image w-24 h-24 md:w-32 md:h-32 object-contain rounded-lg" />
            <span className="logo-text text-4xl md:text-5xl font-orbitron font-bold glow-text">GamaTec.IA</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-orbitron font-black leading-tight opacity-0 animate-hero-entrance" style={{ animationDelay: "0.3s" }}>
            <span className="gradient-text">Sites Profissionais</span>
            <br />
            <span className="text-foreground">Rápidos & Acessíveis</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-hero-entrance" style={{ animationDelay: "0.5s" }}>
            Desenvolvimento web de qualidade para pequenos negócios que querem crescer com presença digital marcante.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 opacity-0 animate-hero-entrance" style={{ animationDelay: "0.7s" }}>
            {[
              { icon: Zap, label: "Entrega Rápida" },
              { icon: Shield, label: "Qualidade Garantida" },
              { icon: Sparkles, label: "Tecnologia Moderna" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 text-primary icon-bounce">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 opacity-0 animate-hero-entrance" style={{ animationDelay: "0.9s" }}>
            <Button
              size="lg"
              className="text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-border hover-lift pulse-ring"
              onClick={scrollToPricing}
              onMouseEnter={() => play("hover")}
            >
              Ver Planos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center gap-2"
              onClick={() => { play("click"); window.open('https://wa.me/5511961442363', '_blank'); }}
              onMouseEnter={() => play("hover")}
            >
              <MessageCircle className="w-5 h-5" />
              Entrar em Contato
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-4 opacity-0 animate-hero-entrance" style={{ animationDelay: "1.1s" }}>
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
          <div className="pt-6 opacity-0 animate-hero-entrance" style={{ animationDelay: "1.3s" }}>
            <button
              onClick={() => { play("whoosh"); navigate("/como-funciona"); }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 font-orbitron"
            >
              <BookOpen className="w-4 h-4" />
              Como a GamaTec.IA Funciona
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
