import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const faqs = [
  {
    q: "Quanto tempo demora para o site ficar pronto?",
    a: "Entre 5 e 10 dias úteis, dependendo do pacote escolhido e da entrega dos materiais.",
  },
  {
    q: "Preciso ter domínio e hospedagem?",
    a: "Não se preocupe! Nós ajudamos em todo o processo de registro de domínio e configuração de hospedagem.",
  },
  {
    q: "O site fica responsivo (funciona no celular)?",
    a: "Sim! Todos os nossos sites são 100% responsivos e otimizados para celular, tablet e desktop.",
  },
  {
    q: "Posso alterar o site depois de pronto?",
    a: "Claro! Oferecemos planos de manutenção mensal para atualizações, ou você pode solicitar alterações avulsas.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Aceitamos Pix, transferência bancária e parcelamento. Consulte condições pelo WhatsApp.",
  },
  {
    q: "Vocês fazem loja virtual (e-commerce)?",
    a: "Sim! Temos pacotes específicos para e-commerce com catálogo de produtos, carrinho e integração com pagamento.",
  },
];

export const FAQ = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: listRef, isVisible: listVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="faq" className="py-20 px-4">
      <div className="container max-w-3xl mx-auto">
        <div ref={headerRef} className={`scroll-reveal ${headerVisible ? "visible" : ""}`}>
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center mb-4">
            <span className="gradient-text">Perguntas Frequentes</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Tire suas dúvidas antes de começar seu projeto
          </p>
        </div>

        <div ref={listRef} className={`stagger-children ${listVisible ? "visible" : ""}`}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border/50 rounded-xl px-6 hover:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
