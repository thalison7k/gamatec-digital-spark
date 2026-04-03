import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { FolderOpen, Plus, MessageSquare, Rocket, FileText, Phone, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const SmartAssistant = lazy(() => import("@/components/dashboard/SmartAssistant"));

interface Project {
  id: string;
  title: string;
  service_type: string;
  status: string;
  estimated_delivery: string | null;
  created_at: string;
  client_id: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useUserRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      setProjects((data as Project[]) || []);
      setLoading(false);
    };

    fetchProjects();
  }, [user]);

  const quickActions = [
    {
      icon: MessageSquare,
      label: "Abrir Solicitação",
      description: "Solicite um novo site ou alteração",
      onClick: () => navigate("/dashboard/tickets"),
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Phone,
      label: "Falar no WhatsApp",
      description: "Tire dúvidas rapidamente",
      onClick: () => window.open("https://wa.me/5511961442363", "_blank"),
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      icon: FileText,
      label: "Como Funciona",
      description: "Entenda nosso processo",
      onClick: () => navigate("/como-funciona"),
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-orbitron font-bold text-foreground">
              Olá, {profile?.full_name || "Usuário"} 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isAdmin ? "Visão geral de todos os projetos" : "Acompanhe seus projetos"}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate("/dashboard/admin")} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Projeto
            </Button>
          )}
        </div>

        {/* Quick Actions - always visible */}
        {!isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Card
                key={action.label}
                className="cursor-pointer hover:border-primary/30 transition-all group"
                onClick={action.onClick}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Projects */}
        <div>
          <h3 className="font-orbitron text-sm font-semibold text-muted-foreground mb-3">
            {isAdmin ? "Todos os Projetos" : "Meus Projetos"}
          </h3>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Rocket className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-orbitron text-base text-foreground mb-1">Nenhum projeto ainda</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-4">
                  {isAdmin
                    ? "Crie um novo projeto para começar."
                    : "Abra uma solicitação e nossa equipe criará seu projeto em breve!"}
                </p>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate(isAdmin ? "/dashboard/admin" : "/dashboard/tickets")}
                >
                  {isAdmin ? <Plus className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                  {isAdmin ? "Novo Projeto" : "Abrir Solicitação"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
        {/* Smart Assistant FAB */}
        <Button
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg shadow-primary/25 p-0 hover:scale-105 transition-transform"
          size="icon"
          title="Assistente Inteligente"
        >
          <BrainCircuit className="h-6 w-6" />
        </Button>

        <Suspense fallback={null}>
          <SmartAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
