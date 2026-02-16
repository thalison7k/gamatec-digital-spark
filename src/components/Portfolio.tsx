import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const portfolioProjects = [
  {
    title: "Gama Paisagismo",
    description: "Site institucional para empresa de jardinagem e paisagismo com catálogo de serviços e formulário de contato.",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop",
    tags: ["Landing Page", "Responsivo", "Whatsapp"],
    link: "https://gamapaisagismo.lovable.app/",
    year: "2025"
  },
  {
    title: "Gama Barbearia",
    description: "Site profissional para barbearia com agendamento, galeria de cortes e integração com WhatsApp para reservas.",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop",
    tags: ["Landing Page", "Agendamento", "Whatsapp"],
    link: "https://gamabarbearia.lovable.app/",
    year: "2026"
  },
  {
    title: "TechStore Pro",
    description: "E-commerce completo para loja de eletrônicos com carrinho de compras, painel administrativo e integração de pagamento.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    tags: ["E-commerce", "React", "API"],
    link: "#",
    year: "2025"
  },
  {
    title: "Clínica Vida Saudável",
    description: "Portal institucional para clínica médica com agendamento online, área do paciente e blog de saúde.",
    image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&h=600&fit=crop",
    tags: ["Site Institucional", "Agendamento", "Blog"],
    link: "#",
    year: "2025"
  },
  {
    title: "RestaurantHub",
    description: "Aplicação web para restaurante com cardápio digital interativo, sistema de reservas e pedidos online.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    tags: ["Cardápio Digital", "Reservas", "PWA"],
    link: "#",
    year: "2025"
  }
];

export const Portfolio = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-background/95 to-muted/20 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div ref={headerRef} className={`text-center mb-16 space-y-4 scroll-reveal ${headerVisible ? 'visible' : ''}`}>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            Nosso Portfólio
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Confira alguns dos projetos que desenvolvemos para nossos clientes
          </p>
        </div>

        <div ref={gridRef} className={`grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children ${gridVisible ? 'visible' : ''}`}>
          {portfolioProjects.map((project, index) => (
            <Card 
              key={index}
              className="group overflow-hidden card-3d bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500"
            >
              <div className="relative overflow-hidden h-64">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute top-4 right-4">
                  <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {project.year}
                  </span>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:bg-primary/20 hover:scale-105"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {project.link !== "#" && (
                  <Button 
                    variant="outline" 
                    className="w-full group/btn hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300"
                    onClick={() => window.open(project.link, '_blank')}
                  >
                    <span>Ver Projeto</span>
                    <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
