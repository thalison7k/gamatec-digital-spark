import {
  Globe,
  Wrench,
  Code2,
  ShoppingBag,
  Smartphone,
  Bot,
  MessageCircle,
  ArrowRight,
  Check,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSounds } from "@/components/SoundProvider";
import { Button } from "@/components/ui/button";

type Servico = {
  icon: typeof Globe;
  title: string;
  description: string;
  features: string[];
  highlight?: boolean;
};

const servicos: Servico[] = [
  {
    icon: Globe,
    title: "Landing Pages",
    description:
      "Páginas de alta conversão para captar leads, divulgar produtos ou impulsionar campanhas.",
    features: [
      "Design responsivo e moderno",
      "Otimização para SEO",
      "Integração com WhatsApp",
      "Performance e carregamento rápido",
    ],
  },
  {
    icon: Wrench,
    title: "Manutenção & Suporte",
    description:
      "Mantemos seu site sempre atualizado, seguro e funcionando com performance ideal.",
    features: [
      "Atualizações de conteúdo",
      "Backups e monitoramento",
      "Correções e melhorias contínuas",
      "Suporte humano dedicado",
    ],
    highlight: true,
  },
  {
    icon: Code2,
    title: "Sistemas Sob Medida",
    description:
      "Plataformas web personalizadas para automatizar processos do seu negócio.",
    features: [
      "Painéis administrativos",
      "Autenticação e níveis de acesso",
      "Integração com APIs externas",
      "Dashboards e relatórios",
    ],
  },
  {
    icon: ShoppingBag,
    title: "E-commerce",
    description:
      "Lojas virtuais completas com gestão de produtos, pagamentos e entregas.",
    features: [
      "Catálogo dinâmico",
      "Checkout seguro",
      "Cupons e promoções",
      "Integração com transportadoras",
    ],
  },
  {
    icon: Smartphone,
    title: "PWA & Apps Web",
    description:
      "Aplicativos instaláveis no celular com experiência nativa, sem app store.",
    features: [
      "Instalação direta no dispositivo",
      "Funcionamento offline",
      "Notificações push",
      "Atualizações automáticas",
    ],
  },
  {
    icon: Bot,
    title: "IA & Automações",
    description:
      "Integração de inteligência artificial e automações para otimizar atendimento e fluxos.",
    features: [
      "Chatbots inteligentes",
      "Assistentes integrados ao site",
      "Geração de conteúdo com IA",
      "Automação de processos",
    ],
  },
];

export const Servicos = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollReveal();
  const { play } = useSounds();

  const openWhatsApp = () => {
    play("click");
    const msg = encodeURIComponent(
      "Olá! Vim pelo site da GamaTec.IA e gostaria de pedir um orçamento."
    );
    window.open(`https://wa.me/5511961442363?text=${msg}`, "_blank");
  };

  return (
    <section
      id="servicos"
      className="py-24 relative overflow-hidden"
      aria-label="Serviços de TI"
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary rounded-full blur-[140px] animate-float-gentle" />
        <div
          className="absolute bottom-1/4 right-0 w-[28rem] h-[28rem] bg-accent rounded-full blur-[160px] animate-float-gentle"
          style={{ animationDelay: "2.5s" }}
        />
      </div>

      <div className="container px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-14">
          {/* Header */}
          <div
            ref={headerRef}
            className={`text-center space-y-4 reveal-3d-flip ${headerVisible ? "visible" : ""}`}
          >
            <span className="inline-block px-4 py-1 rounded-full text-xs font-orbitron uppercase tracking-widest border border-primary/40 text-primary bg-primary/10">
              Nossos Serviços
            </span>
            <h2 className="text-4xl md:text-5xl font-orbitron font-black">
              Soluções <span className="gradient-text">completas de TI</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Do site institucional ao sistema sob medida — tudo para fazer
              seu negócio crescer no digital.
            </p>
          </div>

          {/* Grid */}
          <div
            ref={gridRef}
            className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-children ${gridVisible ? "visible" : ""}`}
          >
            {servicos.map((s, i) => {
              const Icon = s.icon;
              return (
                <article
                  key={i}
                  className={`group relative p-6 rounded-2xl border bg-card/60 backdrop-blur-sm card-3d shimmer transition-all duration-500 ${
                    s.highlight
                      ? "border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.25)] pt-9"
                      : "border-border hover:border-primary/50"
                  }`}
                  onMouseEnter={() => play("hover")}
                  data-voice={s.title}
                >
                  {s.highlight && (
                    <span className="absolute top-3 right-4 z-10 px-3 py-1 text-[10px] font-orbitron uppercase tracking-wider bg-primary text-primary-foreground rounded-full shadow-lg">
                      Mais procurado
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>

                    <h3 className="text-xl font-orbitron font-bold text-foreground">
                      {s.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {s.description}
                    </p>

                    <ul className="space-y-2 pt-2">
                      {s.features.map((f, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          {/* CTA */}
          <div
            ref={ctaRef}
            className={`scroll-reveal-scale ${ctaVisible ? "visible" : ""}`}
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary rounded-full blur-[120px]" />
              </div>

              <div className="relative space-y-5 max-w-2xl mx-auto">
                <h3 className="text-3xl md:text-4xl font-orbitron font-black">
                  Pronto para <span className="gradient-text">tirar sua ideia do papel</span>?
                </h3>
                <p className="text-muted-foreground text-lg">
                  Conte o que você precisa e receba um orçamento personalizado
                  sem compromisso — atendimento direto pelo WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    size="lg"
                    className="text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-border hover-lift gap-2"
                    onClick={openWhatsApp}
                    onMouseEnter={() => play("hover")}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Pedir Orçamento
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2"
                    onClick={() => {
                      play("whoosh");
                      document
                        .getElementById("pricing")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    onMouseEnter={() => play("hover")}
                  >
                    Ver Planos
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
