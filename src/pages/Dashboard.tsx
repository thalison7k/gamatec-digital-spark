import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useVoice } from "@/components/VoiceProvider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectCard from "@/components/dashboard/ProjectCard";
import {
  Plus, MessageSquare, Rocket, FileText, Phone, BrainCircuit,
  BarChart3, Clock, CheckCircle2, AlertCircle, Volume2, VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SmartAssistant = lazy(() => import("@/components/dashboard/SmartAssistant"));
import ProgressCard from "@/components/dashboard/ProgressCard";

interface Project {
  id: string;
  title: string;
  service_type: string;
  status: string;
  estimated_delivery: string | null;
  created_at: string;
  client_id: string;
  url?: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useUserRole();
  const { enabled: hoverVozAtiva, setEnabled: setHoverVozAtiva, vozTipo: hoverVozTipo, setVozTipo: setHoverVozTipo } = useVoice();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [projectsRes, ticketsRes] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("tickets").select("id", { count: "exact", head: true }).eq("created_by", user.id),
      ]);
      setProjects((projectsRes.data as Project[]) || []);
      setTicketCount(ticketsRes.count || 0);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const publishedCount = projects.filter(p => p.status === "published").length;
  const inProgressCount = projects.filter(p => ["in_development", "in_review"].includes(p.status)).length;
  const pendingCount = projects.filter(p => ["awaiting_info", "awaiting_approval"].includes(p.status)).length;

  const stats = [
    { label: "Total Projetos", value: projects.length, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { label: "Publicados", value: publishedCount, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Em Andamento", value: inProgressCount, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Pendentes", value: pendingCount, icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  const quickActions = [
    {
      icon: MessageSquare,
      label: "Abrir Solicitação",
      description: "Solicite um novo site ou alteração",
      onClick: () => navigate("/dashboard/tickets"),
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/30",
    },
    {
      icon: Phone,
      label: "Falar no WhatsApp",
      description: "Tire dúvidas rapidamente",
      onClick: () => window.open("https://wa.me/5511961442363", "_blank"),
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "hover:border-green-500/30",
    },
    {
      icon: FileText,
      label: "Como Funciona",
      description: "Entenda nosso processo",
      onClick: () => navigate("/como-funciona"),
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/30",
    },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Animated Greeting */}
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h2
              className="text-2xl md:text-3xl font-orbitron font-bold text-foreground"
              data-voice={`${greeting()}, ${profile?.full_name || "Usuário"}`}
            >
              {greeting()},{" "}
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                {profile?.full_name || "Usuário"}
              </span>{" "}
              👋
            </h2>
            <p
              className="text-muted-foreground text-sm mt-1"
              data-voice={isAdmin ? "Visão geral de todos os projetos" : "Acompanhe seus projetos e solicitações"}
            >
              {isAdmin ? "Visão geral de todos os projetos" : "Acompanhe seus projetos e solicitações"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Hover Voice Toggle */}
            <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-2 py-1 border border-border/50">
              <Button
                size="sm"
                variant={hoverVozAtiva ? "default" : "outline"}
                className="h-7 gap-1.5 text-xs px-2"
                onClick={() => setHoverVozAtiva(!hoverVozAtiva)}
              >
                {hoverVozAtiva ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                {hoverVozAtiva ? "Leitura On" : "Leitura Off"}
              </Button>
              {hoverVozAtiva && (
                <Select value={hoverVozTipo} onValueChange={(v) => setHoverVozTipo(v as "masculina" | "feminina")}>
                  <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculina">JARVIS</SelectItem>
                    <SelectItem value="feminina">FRIDAY</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            {isAdmin && (
              <Button onClick={() => navigate("/dashboard/admin")} className="gap-2 shadow-lg shadow-primary/20" data-voice="Novo Projeto">
                <Plus className="h-4 w-4" /> Novo Projeto
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {projects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className={cn(
                  "border-border/50 overflow-hidden relative group transition-all duration-300",
                  "hover:border-primary/20 hover:-translate-y-0.5"
                )}
                data-voice={`${stat.label}: ${stat.value}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-4 flex items-center gap-3 relative">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-orbitron font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {!isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
            {quickActions.map((action) => (
              <Card
                key={action.label}
                className={cn(
                  "cursor-pointer transition-all duration-300 group border-border/50 overflow-hidden relative",
                  action.border, "hover:-translate-y-0.5 hover:shadow-lg"
                )}
                onClick={action.onClick}
                data-voice={`${action.label}. ${action.description}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-4 flex items-center gap-3 relative">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3", action.bg)}>
                    <action.icon className={cn("h-5 w-5 transition-transform duration-300", action.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Projects */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-orbitron text-sm font-semibold text-muted-foreground uppercase tracking-wider"
              data-voice={isAdmin ? "Todos os Projetos" : "Meus Projetos"}
            >
              {isAdmin ? "Todos os Projetos" : "Meus Projetos"}
            </h3>
            {projects.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {projects.length} {projects.length === 1 ? "projeto" : "projetos"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-xl bg-muted/50 animate-pulse border border-border/30" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-bounce">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-orbitron text-lg text-foreground mb-2" data-voice="Nenhum projeto ainda">Nenhum projeto ainda</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  {isAdmin
                    ? "Crie um novo projeto para começar."
                    : "Abra uma solicitação e nossa equipe criará seu projeto em breve!"}
                </p>
                <Button
                  className="gap-2 shadow-lg shadow-primary/25"
                  onClick={() => navigate(isAdmin ? "/dashboard/admin" : "/dashboard/tickets")}
                  data-voice={isAdmin ? "Novo Projeto" : "Abrir Solicitação"}
                >
                  {isAdmin ? <Plus className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                  {isAdmin ? "Novo Projeto" : "Abrir Solicitação"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Smart Assistant FAB */}
        <Button
          onClick={() => setAssistantOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full p-0",
            "bg-gradient-to-br from-primary to-cyan-500",
            "shadow-[0_0_30px_hsl(var(--primary)/0.4)]",
            "hover:shadow-[0_0_50px_hsl(var(--primary)/0.6)]",
            "hover:scale-110 active:scale-95",
            "transition-all duration-300",
            "animate-in fade-in zoom-in duration-700"
          )}
          size="icon"
          title="Assistente Inteligente"
          data-voice="Assistente Inteligente"
          style={{ animationDelay: "600ms", animationFillMode: "both" }}
        >
          <BrainCircuit className="h-6 w-6 text-white" />
        </Button>

        <Suspense fallback={null}>
          <SmartAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
