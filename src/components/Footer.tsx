import { Code2 } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-orbitron font-bold glow-text">GamaTec</span>
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
                  <button 
                    onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    WhatsApp
                  </button>
                </li>
                <li>
                  <a 
                    href="mailto:contato@gamatec.com.br"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    contato@gamatec.com.br
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GamaTec. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
