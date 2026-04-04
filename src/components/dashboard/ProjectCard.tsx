import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Eye, ExternalLink, Globe, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; progress: number; glow: string }> = {
  awaiting_info: { label: "Aguardando informações", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", progress: 10, glow: "from-yellow-500/20" },
  in_development: { label: "Em desenvolvimento", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", progress: 40, glow: "from-blue-500/20" },
  in_review: { label: "Em revisão", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", progress: 65, glow: "from-purple-500/20" },
  awaiting_approval: { label: "Aguardando aprovação", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", progress: 85, glow: "from-orange-500/20" },
  published: { label: "Publicado ✓", color: "bg-green-500/20 text-green-400 border-green-500/30", progress: 100, glow: "from-green-500/20" },
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
    url?: string | null;
  };
  index?: number;
}

const ProjectCard = ({ project, index = 0 }: ProjectCardProps) => {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.awaiting_info;
  const isPublished = project.status === "published";
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-border/50 transition-all duration-500 group",
          "hover:border-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)]",
          "hover:-translate-y-1",
          isPublished && "border-green-500/20"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Top gradient accent */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r to-transparent transition-opacity duration-500",
          statusConfig.glow,
          hovered ? "opacity-100" : "opacity-40"
        )} />

        {/* Glow effect on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500",
          hovered && "opacity-100"
        )} />

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-orbitron group-hover:text-primary transition-colors duration-300">
                {project.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{SERVICE_LABELS[project.service_type] || project.service_type}</span>
                {isPublished && (
                  <span className="flex items-center gap-1 text-[10px] text-green-400">
                    <Globe className="h-3 w-3 animate-pulse" /> Online
                  </span>
                )}
              </div>
            </div>
            <Badge variant="outline" className={cn(statusConfig.color, "text-xs border shrink-0")}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progresso</span>
              <span className={cn("font-mono font-semibold", isPublished && "text-green-400")}>
                {statusConfig.progress}%
              </span>
            </div>
            <div className="relative">
              <Progress value={statusConfig.progress} className="h-2" />
              {isPublished && (
                <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-green-400 animate-pulse" />
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Criado: {format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </div>
            {project.estimated_delivery && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {isPublished ? "Entregue" : "Entrega"}: {format(new Date(project.estimated_delivery), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300"
              onClick={() => navigate(`/dashboard/project/${project.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver detalhes
            </Button>
            {isPublished && project.url && (
              <Button
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:shadow-green-500/40 hover:scale-105"
                onClick={() => window.open(project.url!, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Acessar Site
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectCard;
