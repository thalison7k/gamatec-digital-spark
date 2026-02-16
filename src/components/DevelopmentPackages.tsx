import { PricingCard } from "./PricingCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const DevelopmentPackages = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();

  const packages = [
    {
      title: "Pacote Start",
      description: "Landing Page (1 página)",
      price: "R$ 600 - R$ 900",
      features: [
        "Página única profissional",
        "1 formulário (contato ou WhatsApp)",
        "Integração com redes sociais",
        "Layout 100% responsivo",
        "Otimização básica de velocidade",
        "Suporte durante 30 dias"
      ]
    },
    {
      title: "Pacote Essencial",
      description: "Site Institucional (3-5 páginas)",
      price: "R$ 1.200 - R$ 2.000",
      features: [
        "Página inicial + Sobre + Serviços + Contato",
        "Integração com Google Maps",
        "Formulário avançado e WhatsApp",
        "Layout responsivo premium",
        "Galeria de fotos/produtos",
        "Otimização de SEO básica",
        "Suporte durante 60 dias"
      ],
      highlighted: true
    },
    {
      title: "Pacote Profissional",
      description: "Site com Blog ou Recursos Extras",
      price: "R$ 2.500 - R$ 4.500",
      features: [
        "Tudo do Essencial incluído",
        "Sistema de posts ou blog completo",
        "Otimização avançada de SEO",
        "Integrações extras (APIs, forms avançados)",
        "Área de depoimentos/avaliações",
        "Dashboard administrativo",
        "Suporte durante 90 dias"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 relative">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div ref={headerRef} className={`text-center space-y-4 scroll-reveal ${headerVisible ? 'visible' : ''}`}>
            <h2 className="text-4xl md:text-5xl font-orbitron font-black">
              <span className="gradient-text">Pacotes de Desenvolvimento</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o pacote ideal para o seu negócio. Todos incluem design moderno e tecnologia de ponta.
            </p>
          </div>

          <div ref={gridRef} className={`grid md:grid-cols-3 gap-8 pt-4 stagger-children ${gridVisible ? 'visible' : ''}`}>
            {packages.map((pkg, index) => (
              <PricingCard key={index} {...pkg} delay={index * 150} />
            ))}
          </div>

          <div className="text-center pt-8">
            <p className="text-muted-foreground">
              Precisa de algo personalizado?{" "}
              <button 
                onClick={() => window.open('https://wa.me/5511961442363?text=Olá! Gostaria de um orçamento personalizado', '_blank')}
                className="text-primary hover:underline font-semibold"
              >
                Fale conosco
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
