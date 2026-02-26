import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
} from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  created_at: string;
  user_id: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <CheckCircle className="h-4 w-4 text-green-400" />,
  status_change: <Activity className="h-4 w-4 text-blue-400" />,
  material_upload: <FileText className="h-4 w-4 text-purple-400" />,
  ticket_opened: <MessageSquare className="h-4 w-4 text-yellow-400" />,
  message: <MessageSquare className="h-4 w-4 text-primary" />,
  deadline: <Clock className="h-4 w-4 text-orange-400" />,
  default: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
};

const ProjectTimeline = ({ projectId }: { projectId: string }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("project_activities")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(50);

      setActivities((data as ActivityItem[]) || []);
      setLoading(false);
    };

    fetchActivities();

    // Realtime subscription
    const channel = supabase
      .channel(`activities-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_activities",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setActivities((prev) => [payload.new as ActivityItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-orbitron flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Atividades do Projeto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma atividade registrada ainda.
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 relative">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center z-10">
                    {ACTION_ICONS[activity.action] || ACTION_ICONS.default}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
