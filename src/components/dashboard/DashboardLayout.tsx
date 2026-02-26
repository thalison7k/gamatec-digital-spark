import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useSounds } from "@/components/SoundProvider";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  LogOut,
  Shield,
  Menu,
  X,
  ArrowLeft,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";
import gamatecLogo from "@/assets/gamatec-logo.png";
import NotificationBell from "@/components/dashboard/NotificationBell";


interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useUserRole();
  const { play, enabled, setEnabled } = useSounds();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Painel", path: "/dashboard" },
    { icon: MessageSquare, label: "Solicitações", path: "/dashboard/tickets" },
    ...(isAdmin
      ? [
          { icon: Users, label: "Clientes", path: "/dashboard/clients" },
          { icon: Shield, label: "Admin", path: "/dashboard/admin" },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center gap-3">
          <img src={gamatecLogo} alt="GamaTec" className="h-8 w-auto" />
          <span className="font-orbitron text-sm text-primary font-bold">GamaTec.IA</span>
          <button className="lg:hidden ml-auto text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground">Bem-vindo(a)</p>
          <p className="text-sm font-semibold text-foreground truncate">
            {profile?.full_name || "Usuário"}
          </p>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              <Shield className="h-3 w-3" /> Admin
            </span>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive(item.path)
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Settings section */}
        <div className="p-3 border-t border-border space-y-1">
          <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-3 w-3" /> Configurações
          </p>
          <button
            onClick={() => { play("click"); toggleTheme(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </button>
          <button
            onClick={() => {
              if (!enabled) {
                setEnabled(true);
              } else {
                play("click");
                setEnabled(false);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {enabled ? "Desativar Sons" : "Ativar Sons"}
          </button>
        </div>

        {/* Back + Logout */}
        <div className="p-3 border-t border-border space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-primary"
            onClick={() => navigate("/site")}
          >
            <ArrowLeft className="h-4 w-4" />
            Página Principal
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3 lg:px-6">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-orbitron text-sm text-foreground truncate flex-1">Painel do Cliente</h1>
          <NotificationBell />
        </header>
        <div className="flex-1 p-4 lg:p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
