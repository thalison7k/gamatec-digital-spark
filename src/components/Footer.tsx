import logo from "@/assets/gamatec-logo.png";
import { Youtube, Instagram, MessageCircle, BookOpen } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const { ref, isVisible } = useScrollReveal();
  const navigate = useNavigate();

  return (
    <footer className="py-12 border-t border-border bg-secondary/30 relative overflow-hidden">
      <div className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/3 rounded-full blur-[120px]" />

      <div ref={ref} className={`container px-4 relative z-10 scroll-reveal ${isVisible ? 'visible' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="logo-container flex items-center gap-3">
                <img src={logo} alt="GamaTec.IA Logo" className="logo-image w-16 h-16 object-contain rounded-lg" />
                <span className="logo-text text-2xl font-orbitron font-bold glow-text">GamaTec.IA</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Sites profissionais, rápidos e acessíveis para pequenos negócios.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-orbitron font-bold text-foreground">Serviços</h3>
              <ul className="space-y-2 text-sm">
                {["Desenvolvimento Web", "Manutenção de Sites", "Consultoria"].map((item, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => i < 2 
                        ? document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
                        : window.open('https://wa.me/5511999999999', '_blank')
                      }
                      className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {item}
                    </button>
                  </li>
                ))}
                <li>
                  <button 
                    onClick={() => navigate("/como-funciona")}
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2"
                  >
                    <BookOpen className="w-3 h-3" />
                    Como Funciona
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-orbitron font-bold text-foreground">Contato</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:gamatec350@gmail.com" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">
                    gamatec350@gmail.com
                  </a>
                </li>
                {[
                  { icon: MessageCircle, label: "WhatsApp", url: "https://wa.me/5511961442363" },
                  { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/reel/DRlEVL5DME_/?igsh=MXdxemZjaHA3cnRwMA==" },
                  { icon: Youtube, label: "YouTube", url: "https://www.youtube.com/@GamaTec-b6k" },
                ].map(({ icon: Icon, label, url }, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => window.open(url, '_blank')}
                      className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 hover:translate-x-1 icon-bounce"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GamaTec.IA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
