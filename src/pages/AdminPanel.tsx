import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, FolderOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_OPTIONS = [
  { value: "awaiting_info", label: "Aguardando informações" },
  { value: "in_development", label: "Em desenvolvimento" },
  { value: "in_review", label: "Em revisão" },
  { value: "awaiting_approval", label: "Aguardando aprovação" },
  { value: "published", label: "Publicado" },
];

const SERVICE_OPTIONS = [
  { value: "landing_page", label: "Landing Page" },
  { value: "institutional_site", label: "Site Institucional" },
  { value: "blog", label: "Blog" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "web_app", label: "Web App" },
  { value: "other", label: "Outro" },
];

interface Client {
  user_id: string;
  full_name: string | null;
}

interface Project {
  id: string;
  title: string;
  service_type: string;
  status: string;
  client_id: string;
  estimated_delivery: string | null;
  created_at: string;
}

const AdminPanel = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // New project form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [serviceType, setServiceType] = useState("landing_page");
  const [clientId, setClientId] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  useEffect(() => {
    if (roleLoading) return;
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, [isAdmin, roleLoading]);

  const fetchData = async () => {
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name"),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
    ]);
    setClients((clientsRes.data as Client[]) || []);
    setProjects((projectsRes.data as Project[]) || []);
    setLoading(false);
  };

  const handleCreateProject = async () => {
    if (!title || !clientId) return;

    const { error } = await supabase.from("projects").insert([{
      title,
      service_type: serviceType as any,
      client_id: clientId,
      estimated_delivery: estimatedDelivery || null,
    }]);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Projeto criado!" });
    setShowForm(false);
    setTitle("");
    setClientId("");
    setEstimatedDelivery("");
    fetchData();
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    await supabase.from("projects").update({ status: newStatus as any }).eq("id", projectId);
    fetchData();
  };

  if (roleLoading || loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-orbitron font-bold">Painel Administrativo</h2>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2" size="sm">
            <Plus className="h-4 w-4" /> Novo Projeto
          </Button>
        </div>

        {/* Create project form */}
        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-base font-orbitron">Criar Projeto</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background/50 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de Serviço</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cliente</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.user_id} value={c.user_id}>
                          {c.full_name || "Sem nome"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Previsão de Entrega</Label>
                  <Input type="date" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} className="bg-background/50 text-sm" />
                </div>
              </div>
              <Button onClick={handleCreateProject} disabled={!title || !clientId}>Criar Projeto</Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold font-orbitron">{clients.length}</p>
            <p className="text-xs text-muted-foreground">Clientes</p>
          </Card>
          <Card className="p-4 text-center">
            <FolderOpen className="h-6 w-6 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold font-orbitron">{projects.length}</p>
            <p className="text-xs text-muted-foreground">Projetos</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="h-6 w-6 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold font-orbitron">
              {projects.filter((p) => p.status !== "published").length}
            </p>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold font-orbitron">
              {projects.filter((p) => p.status === "published").length}
            </p>
            <p className="text-xs text-muted-foreground">Publicados</p>
          </Card>
        </div>

        {/* All Projects */}
        <Card>
          <CardHeader><CardTitle className="text-base font-orbitron">Todos os Projetos</CardTitle></CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum projeto criado.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => {
                  const clientName = clients.find((c) => c.user_id === p.client_id)?.full_name || "—";
                  return (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">Cliente: {clientName}</p>
                      </div>
                      <Select
                        value={p.status}
                        onValueChange={(val) => handleStatusChange(p.id, val)}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => navigate(`/dashboard/project/${p.id}`)}
                      >
                        Detalhes
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clients */}
        <Card>
          <CardHeader><CardTitle className="text-base font-orbitron">Clientes</CardTitle></CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum cliente cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {clients.map((c) => (
                  <div key={c.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                      {(c.full_name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.full_name || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground">
                        {projects.filter((p) => p.client_id === c.user_id).length} projeto(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
