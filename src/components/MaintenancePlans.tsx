import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Wrench } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSounds } from "@/components/SoundProvider";

export const MaintenancePlans = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();
  const { play } = useSounds();

  const plans = [
    {
      title: "Plano Básico",
      price: "R$ 150/mês",
      features: ["Suporte 1x por mês", "Alterações simples de texto/imagens", "Monitoramento básico", "Resposta em até 48h"]
    },
    {
      title: "Plano Avançado",
      price: "R$ 250/mês",
      features: ["2 a 4 alterações por mês", "Manutenção de plugins/componentes", "Pequenos ajustes no layout", "Suporte prioritário", "Resposta em até 24h"],
      highlighted: true
    },
    {
      title: "Plano Premium",
      price: "R$ 350 - R$ 500/mês",
      features: ["Atualizações semanais ilimitadas", "Backup completo automatizado", "Ajustes contínuos e otimização", "Suporte ultra rápido (1h-24h)", "Relatórios mensais de desempenho"]
    }
  ];

  return (
    <section className="py-20 bg-secondary/30 relative">
      {/* Background glow - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />

      <div className="container px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div ref={headerRef} className={`text-center space-y-4 scroll-reveal ${headerVisible ? 'visible' : ''}`}>
            <div className="inline-flex items-center gap-2 mb-4 icon-bounce">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-orbitron font-black">
              Planos de <span className="gradient-text">Manutenção</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mantenha seu site sempre atualizado, seguro e funcionando perfeitamente.
            </p>
          </div>

          <div ref={gridRef} className="grid md:grid-cols-3 gap-8 pt-4">
            {plans.map((plan, index) => {
              const reveal =
                index === 0 ? "scroll-reveal-left" : index === 2 ? "scroll-reveal-right" : "scroll-reveal-scale";
              return (
                <div
                  key={index}
                  className={`${reveal} ${gridVisible ? "visible" : ""}`}
                  style={{ transitionDelay: `${index * 180}ms` }}
                >
                  <Card
                    className={`relative overflow-visible p-8 card-3d shimmer ${
                      plan.highlighted
                        ? "border-primary glow-border bg-gradient-to-br from-card via-secondary to-card"
                        : "border-border bg-card hover:border-primary/50"
                    } transition-all duration-500`}
                    onMouseEnter={() => play("hover")}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold animate-scale-bounce">
                        Recomendado
                      </div>
                    )}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-orbitron font-bold text-foreground">{plan.title}</h3>
                        <div className="text-3xl font-orbitron font-black text-primary">{plan.price}</div>
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-foreground/90 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full transition-all duration-300 ${
                          plan.highlighted
                            ? "bg-accent hover:bg-accent/90 text-accent-foreground hover:shadow-[0_0_30px_hsl(var(--accent)/0.4)]"
                            : "bg-secondary hover:bg-secondary/80 text-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                        }`}
                        size="lg"
                        onClick={() => {
                          play("success");
                          window.open("https://wa.me/5511961442363?text=Olá! Tenho interesse no " + plan.title, "_blank");
                        }}
                      >
                        Contratar
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-8">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              💡 <span className="font-semibold text-foreground">Dica Importante:</span> A manutenção mensal garante que seu site esteja sempre atualizado, seguro e com ótimo desempenho. É a melhor forma de proteger seu investimento e manter uma presença digital profissional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
