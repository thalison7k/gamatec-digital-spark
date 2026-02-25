import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSounds } from "@/components/SoundProvider";
import {
  ArrowLeft,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import gamatecLogo from "@/assets/gamatec-logo.png";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { play } = useSounds();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    play("click");
    await signOut();
    toast({ title: "Logout realizado", description: "Até logo!" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-background/60 backdrop-blur-md border-b border-border/30">
      {/* Left – Logo */}
      <button
        onClick={() => { play("whoosh"); navigate("/"); }}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img src={gamatecLogo} alt="GamaTec" className="h-8 w-auto" />
        <span className="font-orbitron text-sm font-bold text-primary hidden sm:inline">
          GamaTec.IA
        </span>
      </button>

      {/* Right – User actions */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary gap-2"
              onClick={() => { play("click"); navigate("/dashboard"); }}
              onMouseEnter={() => play("hover")}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Painel</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-9 w-9 border-border/50 hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)] transition-all"
                  onMouseEnter={() => play("hover")}
                >
                  <User className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground">Logado como</p>
                  <p className="text-sm font-medium truncate">
                    {profile?.full_name || user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Meu Painel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/site")} className="cursor-pointer gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Página Principal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
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
