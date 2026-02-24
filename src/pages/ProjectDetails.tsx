import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Upload,
  FileText,
  Calendar,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG: Record<string, { label: string; color: string; progress: number }> = {
  awaiting_info: { label: "Aguardando informações", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", progress: 10 },
  in_development: { label: "Em desenvolvimento", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", progress: 40 },
  in_review: { label: "Em revisão", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", progress: 65 },
  awaiting_approval: { label: "Aguardando aprovação", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", progress: 85 },
  published: { label: "Publicado", color: "bg-green-500/20 text-green-400 border-green-500/30", progress: 100 },
};

const SERVICE_LABELS: Record<string, string> = {
  landing_page: "Landing Page",
  institutional_site: "Site Institucional",
  blog: "Blog",
  ecommerce: "E-commerce",
  web_app: "Web App",
  other: "Outro",
};

interface Material {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  business_description: string | null;
  desired_colors: string | null;
  social_media: string | null;
  phone_whatsapp: string | null;
  created_at: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Material form
  const [businessDesc, setBusinessDesc] = useState("");
  const [colors, setColors] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [phoneWhatsapp, setPhoneWhatsapp] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      const [projectRes, materialsRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).single(),
        supabase.from("project_materials").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      ]);

      setProject(projectRes.data);
      setMaterials((materialsRes.data as Material[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [id, user]);

  const handleUpload = async () => {
    if (!selectedFile || !user || !id) return;
    setUploading(true);

    try {
      const filePath = `${user.id}/${id}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-materials")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("project-materials")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("project_materials").insert({
        project_id: id,
        uploaded_by: user.id,
        file_name: selectedFile.name,
        file_url: urlData.publicUrl,
        file_type: selectedFile.type,
        business_description: businessDesc || null,
        desired_colors: colors || null,
        social_media: socialMedia || null,
        phone_whatsapp: phoneWhatsapp || null,
      });

      if (insertError) throw insertError;

      toast({ title: "Material enviado!", description: "Arquivo enviado com sucesso." });

      // Refresh materials
      const { data } = await supabase
        .from("project_materials")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      setMaterials((data as Material[]) || []);

      // Reset form
      setSelectedFile(null);
      setBusinessDesc("");
      setColors("");
      setSocialMedia("");
      setPhoneWhatsapp("");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Projeto não encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
            Voltar ao Painel
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.awaiting_info;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-orbitron font-bold">{project.title}</h2>
            <p className="text-sm text-muted-foreground">{SERVICE_LABELS[project.service_type]}</p>
          </div>
          <Badge variant="outline" className={statusConfig.color + " border"}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso do projeto</span>
              <span className="font-semibold text-primary">{statusConfig.progress}%</span>
            </div>
            <Progress value={statusConfig.progress} className="h-3" />
            <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Criado: {format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              {project.estimated_delivery && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Entrega: {format(new Date(project.estimated_delivery), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ticket button */}
        <Button
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => navigate(`/dashboard/tickets?project=${id}`)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Abrir Solicitação
        </Button>

        {/* Materials Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-orbitron flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Materiais do Projeto
            </CardTitle>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground mt-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Essas informações serão utilizadas para o desenvolvimento do seu site.
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Sobre o negócio</Label>
                <Textarea placeholder="Descreva seu negócio..." value={businessDesc} onChange={(e) => setBusinessDesc(e.target.value)} className="bg-background/50 text-sm min-h-[80px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cores desejadas</Label>
                <Input placeholder="Ex: azul, branco, preto" value={colors} onChange={(e) => setColors(e.target.value)} className="bg-background/50 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Redes sociais</Label>
                <Input placeholder="@instagram, facebook..." value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)} className="bg-background/50 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telefone / WhatsApp</Label>
                <Input placeholder="(00) 00000-0000" value={phoneWhatsapp} onChange={(e) => setPhoneWhatsapp(e.target.value)} className="bg-background/50 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Upload de arquivo (logotipo, imagens)</Label>
              <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="bg-background/50 text-sm" />
            </div>

            <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : "Enviar Material"}
            </Button>

            {/* Uploaded files list */}
            {materials.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-semibold text-foreground">Arquivos enviados</h4>
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 text-sm">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{m.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(m.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        {m.file_type && ` • ${m.file_type}`}
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

export default ProjectDetails;
