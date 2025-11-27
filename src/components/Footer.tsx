import logo from "@/assets/gamatec-logo.png";
import { Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="logo-container flex items-center gap-3">
                <img src={logo} alt="GamaTec.IA Logo" className="logo-image w-16 h-16 object-contain rounded-lg" />
                <span className="logo-text text-2xl font-orbitron font-bold glow-text">GamaTec.IA</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Sites profissionais, rápidos e acessíveis para pequenos negócios.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="font-orbitron font-bold text-foreground">Serviços</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Desenvolvimento Web
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Manutenção de Sites
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Consultoria
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-orbitron font-bold text-foreground">Contato</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="mailto:gamatec350@gmail.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    gamatec350@gmail.com
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('https://www.youtube.com/@GamaTec-b6k', '_blank')}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
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
