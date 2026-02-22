import { Zap, MessageCircle, Shield, Sparkles, TrendingUp, HeadphonesIcon } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const Differentials = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();

  const differentials = [
    { icon: Zap, title: "Velocidade de Entrega", description: "Sites prontos em tempo recorde sem comprometer a qualidade" },
    { icon: Sparkles, title: "Layout Moderno", description: "Design atual que destaca seu negócio da concorrência" },
    { icon: MessageCircle, title: "Integração WhatsApp", description: "Seus clientes entram em contato com apenas um clique" },
    { icon: HeadphonesIcon, title: "Suporte Humano", description: "Atendimento rápido e pessoal quando você precisar" },
    { icon: Shield, title: "Manutenção Opcional", description: "Planos flexíveis para manter tudo funcionando perfeitamente" },
    { icon: TrendingUp, title: "Resultados Reais", description: "Sites que convertem visitantes em clientes" }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 hidden md:block">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary rounded-full blur-[128px] animate-float-gentle" />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-accent rounded-full blur-[100px] animate-float-gentle" style={{ animationDelay: "3s" }} />
      </div>

      <div className="container px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div ref={headerRef} className={`text-center space-y-4 scroll-reveal ${headerVisible ? 'visible' : ''}`}>
            <h2 className="text-4xl md:text-5xl font-orbitron font-black">
              Por que escolher a <span className="gradient-text">GamaTec.IA</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Somos especialistas em transformar pequenos negócios em grandes presenças digitais.
            </p>
          </div>

          <div ref={gridRef} className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children ${gridVisible ? 'visible' : ''}`}>
            {differentials.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="group p-6 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 card-3d shimmer icon-bounce"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-orbitron font-bold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
