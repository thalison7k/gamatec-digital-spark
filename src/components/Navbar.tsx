/**
 * ============================================================
 * Navbar — Barra de Navegação Global
 * ============================================================
 * Aparece no topo do site institucional (/site). Contém:
 *  - Logo (volta para /site)
 *  - Links de seção (Serviços, Planos, Portfólio, FAQ)
 *    → usa scrollToSection / navigateToSection para deep-link
 *  - Botão "Painel" (vai para /dashboard)
 *  - Avatar com dropdown:
 *      Meu Painel | Página Principal | Configurações |
 *      Ajustes Rápidos (tema/sons) | Sair
 *  - Menu mobile (Sheet) replicando tudo acima
 *
 * Mobile-first: o dropdown usa z-[100] e backdrop-blur para
 * nunca ficar atrás de outros elementos.
 * ============================================================
 */
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSounds } from "@/components/SoundProvider";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useMemo, useState } from "react";
import { scrollToSection, navigateToSection } from "@/lib/scrollToSection";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowLeft,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Settings,
  Menu,
  Wrench,
  Tag,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import gamatecLogo from "@/assets/gamatec-logo.png";

function getAvatarUrl(user: any, profileName?: string | null): string {
  // 1. OAuth avatar (Google, GitHub, etc.)
  if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
  if (user?.user_metadata?.picture) return user.user_metadata.picture;
  // 2. Gravatar via email
  if (user?.email) {
    const email = user.email.trim().toLowerCase();
    return `https://www.gravatar.com/avatar/${simpleHash(email)}?d=404&s=80`;
  }
  return "";
}

function simpleHash(str: string): string {
  // Simple hash for Gravatar - we use ui-avatars as fallback anyway
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { play, enabled, setEnabled } = useSounds();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionLinks = useMemo(
    () => [
      { id: "servicos", label: "Serviços", icon: Wrench },
      { id: "pricing", label: "Planos", icon: Tag },
      { id: "portfolio", label: "Portfólio", icon: Briefcase },
      { id: "faq", label: "FAQ", icon: HelpCircle },
    ],
    []
  );

  // On mount / route change with hash → scroll to that section
  useEffect(() => {
    if (location.hash && location.pathname === "/site") {
      const id = location.hash.replace("#", "");
      const t = window.setTimeout(() => scrollToSection(id), 200);
      return () => window.clearTimeout(t);
    }
  }, [location.pathname, location.hash]);

  const handleSectionClick = (id: string) => {
    play("whoosh");
    setMobileOpen(false);
    navigateToSection(id, navigate, location.pathname);
  };

  const handleLogout = async () => {
    play("click");
    await signOut();
    toast({ title: "Logout realizado", description: "Até logo!" });
  };

  return (
    <nav role="navigation" aria-label="Navegação principal" className="navbar-3d-enter fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-background/60 backdrop-blur-md border-b border-border/30">
      {/* Left – Logo */}
      <button
        onClick={() => { play("whoosh"); navigate("/site"); }}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img src={gamatecLogo} alt="GamaTec" className="h-8 w-auto" />
        <span className="font-orbitron text-sm font-bold text-primary hidden sm:inline">
          GamaTec.IA
        </span>
      </button>

      {/* Center – Section links (desktop) */}
      <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {sectionLinks.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleSectionClick(id)}
            onMouseEnter={() => play("hover")}
            data-voice={label}
            className="navlink-3d relative px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right – User actions */}
      <div className="flex items-center gap-2">
        {/* Mobile menu trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden menu-trigger-3d h-9 w-9"
              onMouseEnter={() => play("hover")}
              onClick={() => play("click")}
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="font-orbitron text-primary">Navegação</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1" aria-label="Menu mobile">
              {sectionLinks.map(({ id, label, icon: Icon }, i) => (
                <button
                  key={id}
                  onClick={() => handleSectionClick(id)}
                  className="navlink-3d flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/30"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  {label}
                </button>
              ))}

              {user && (
                <>
                  <div className="my-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <p className="px-3 text-[10px] uppercase tracking-wider text-cyan-300/70 font-bold mb-1">
                    Conta
                  </p>
                  <button
                    onClick={() => { play("click"); setMobileOpen(false); navigate("/dashboard"); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/30"
                  >
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Meu Painel
                  </button>
                  <button
                    onClick={() => { play("click"); setMobileOpen(false); navigate("/dashboard/configuracoes"); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/30"
                  >
                    <Settings className="h-5 w-5 text-purple-400" />
                    Configurações
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); toggleTheme(); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/30"
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-blue-300" />}
                    {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setEnabled(!enabled); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/30"
                  >
                    {enabled ? <Volume2 className="h-5 w-5 text-green-400" /> : <VolumeX className="h-5 w-5 text-slate-400" />}
                    {enabled ? "Desativar Sons" : "Ativar Sons"}
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30 mt-1"
                  >
                    <LogOut className="h-5 w-5" />
                    Sair
                  </button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {user ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary gap-2"
              onClick={() => { play("click"); navigate("/dashboard"); }}
              onMouseEnter={() => play("hover")}
              data-voice="Painel"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Painel</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="menu-trigger-3d rounded-full h-9 w-9 p-0 overflow-hidden border border-border/50 hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)] transition-all"
                  onMouseEnter={() => play("hover")}
                  aria-label="Abrir menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={getAvatarUrl(user, profile?.full_name)}
                      alt={profile?.full_name || "Avatar"}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {getInitials(profile?.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56 z-[100] border-2 border-primary/30 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-primary/20 p-1.5"
              >
                <DropdownMenuLabel className="font-normal px-2 py-2 rounded-md bg-gradient-to-br from-primary/10 to-purple-500/10 mb-1 border border-primary/20">
                  <p className="text-[10px] text-cyan-300/70 uppercase tracking-wider font-bold">Logado como</p>
                  <p className="text-sm font-bold text-white truncate">
                    {profile?.full_name || user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard")}
                  className="cursor-pointer gap-2 rounded-md text-slate-200 focus:bg-primary/20 focus:text-white data-[highlighted]:bg-primary/20 data-[highlighted]:text-white transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Meu Painel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/site")}
                  className="cursor-pointer gap-2 rounded-md text-slate-200 focus:bg-primary/20 focus:text-white data-[highlighted]:bg-primary/20 data-[highlighted]:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-cyan-400" />
                  Página Principal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/configuracoes")}
                  className="cursor-pointer gap-2 rounded-md text-slate-200 focus:bg-primary/20 focus:text-white data-[highlighted]:bg-primary/20 data-[highlighted]:text-white transition-colors"
                >
                  <Settings className="h-4 w-4 text-purple-400" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                {/* Quick toggles submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2 rounded-md text-slate-200 focus:bg-primary/20 focus:text-white data-[highlighted]:bg-primary/20 data-[highlighted]:text-white data-[state=open]:bg-primary/20 data-[state=open]:text-white transition-colors">
                    <Sun className="h-4 w-4 text-yellow-400" />
                    Ajustes Rápidos
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    sideOffset={8}
                    className="z-[100] border-2 border-primary/30 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-primary/20 p-1.5"
                  >
                    <DropdownMenuItem
                      onClick={(e) => { e.preventDefault(); toggleTheme(); }}
                      className="cursor-pointer gap-2 rounded-md text-slate-200 focus:bg-primary/20 focus:text-white data-[highlighted]:bg-primary/20 data-[highlighted]:text-white transition-colors"
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-blue-300" />}
                      {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        setEnabled(!enabled);
                      }}
                      className="cursor-pointer gap-2 rounded-md text-slate-200 focus:bg-primary/20 focus:text-white data-[highlighted]:bg-primary/20 data-[highlighted]:text-white transition-colors"
                    >
                      {enabled ? <Volume2 className="h-4 w-4 text-green-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
                      {enabled ? "Desativar Sons" : "Ativar Sons"}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 rounded-md text-red-400 focus:bg-red-500/20 focus:text-red-300 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={() => { play("click"); navigate("/auth"); }}
            onMouseEnter={() => play("hover")}
          >
            <LogIn className="h-4 w-4" />
            <span className="text-sm">Entrar</span>
          </Button>
        )}
      </div>
    </nav>
  );
};
