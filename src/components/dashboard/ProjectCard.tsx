import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Eye } from "lucide-react";
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

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    service_type: string;
    status: string;
    estimated_delivery: string | null;
    created_at: string;
  };
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.awaiting_info;

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-orbitron">{project.title}</CardTitle>
          <Badge variant="outline" className={statusConfig.color + " text-xs border"}>
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{SERVICE_LABELS[project.service_type] || project.service_type}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progresso</span>
            <span>{statusConfig.progress}%</span>
          </div>
          <Progress value={statusConfig.progress} className="h-2" />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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

        <Button
          variant="outline"
          size="sm"
          className="w-full border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => navigate(`/dashboard/project/${project.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver detalhes do projeto
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
