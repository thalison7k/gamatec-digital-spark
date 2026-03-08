import { Star } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const testimonials = [
  {
    name: "Marcos Silva",
    role: "Dono de Barbearia",
    text: "O site ficou incrível e aumentou meus clientes em 40%. Atendimento rápido e profissional!",
    stars: 5,
  },
  {
    name: "Ana Costa",
    role: "Personal Trainer",
    text: "Finalmente tenho uma presença digital de verdade. Meus alunos me encontram com facilidade agora.",
    stars: 5,
  },
  {
    name: "Lucas Ferreira",
    role: "Pizzaria Delivery",
    text: "Entrega super rápida e o site ficou moderno. Já recebi elogios de vários clientes!",
    stars: 5,
  },
];

export const Testimonials = () => {
  const { ref: sectionRef } = useScrollReveal<HTMLElement>();

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center mb-4">
          <span className="gradient-text">O que dizem nossos clientes</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Resultados reais de pequenos negócios que cresceram com a GamaTec.IA
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-6 flex flex-col gap-4 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_hsl(var(--primary)/0.15)]"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground/90 italic leading-relaxed">"{t.text}"</p>
              <div className="mt-auto pt-2 border-t border-border/30">
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
