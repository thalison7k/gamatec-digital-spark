import { Button } from "@/components/ui/button";
import { Zap, Shield, Sparkles, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/gamatec-logo.png";

export const Hero = () => {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px] animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-[128px] animate-glow-pulse" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo/Brand */}
          <div className="logo-container inline-flex items-center gap-4 mb-4">
            <img src={logo} alt="GamaTec.IA Logo" className="logo-image w-24 h-24 md:w-32 md:h-32 object-contain rounded-lg" />
            <span className="logo-text text-4xl md:text-5xl font-orbitron font-bold glow-text">GamaTec.IA</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-orbitron font-black leading-tight">
            <span className="gradient-text">Sites Profissionais</span>
            <br />
            <span className="text-foreground">Rápidos & Acessíveis</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Desenvolvimento web de qualidade para pequenos negócios que querem crescer com presença digital marcante.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 pt-8">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Entrega Rápida</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Qualidade Garantida</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Tecnologia Moderna</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              className="text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-border hover-lift"
              onClick={scrollToPricing}
            >
              Ver Planos
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              onClick={() => window.open('mailto:gamatec350@gmail.com', '_blank')}
            >
              Entrar em Contato
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 pt-4">
            <button
              onClick={() => window.open('https://www.instagram.com/gamatec', '_blank')}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </button>
            <button
              onClick={() => window.open('https://www.youtube.com/@GamaTec-b6k', '_blank')}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
