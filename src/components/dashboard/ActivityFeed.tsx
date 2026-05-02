import { useState } from "react";
import { useGamification, ActivityEvent } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  History, Sparkles, Coins, Trophy, TrendingUp, Calendar,
  Rocket, Flame, Compass, ChevronDown, ChevronUp, Inbox
} from "lucide-react";

const BADGE_ICON_MAP: Record<string, any> = { Rocket, Flame, Trophy, Compass };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} ${d === 1 ? "dia" : "dias"}`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getEventStyle(event: ActivityEvent) {
  switch (event.type) {
    case "badge":
      return { Icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", glow: "shadow-yellow-500/20" };
    case "level_up":
      return { Icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30", glow: "shadow-purple-500/20" };
    case "daily_login":
      return { Icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/30", glow: "shadow-cyan-500/20" };
    case "coins":
      return { Icon: Coins, color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30", glow: "shadow-yellow-500/20" };
    default:
      return { Icon: Sparkles, color: "text-primary", bg: "bg-primary/15", border: "border-primary/30", glow: "shadow-primary/20" };
  }
}

const ActivityFeed = () => {
  const { user } = useAuth();
  const { data } = useGamification(user?.id);
  const [expanded, setExpanded] = useState(false);

  const events = data.activity;
  const visibleEvents = expanded ? events : events.slice(0, 5);

  return (
    <Card
      className="border-border/50 overflow-hidden relative"
      data-voice={`Feed de Conquistas. ${events.length} eventos no histórico.`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-primary/5 opacity-60 pointer-events-none" />

      <CardContent className="p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center shadow-lg shadow-purple-500/30">
              <History className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-bold text-foreground">Feed de Conquistas</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Seu histórico de XP, coins e badges
              </p>
            </div>
          </div>
          {events.length > 0 && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-full">
              {events.length}
            </span>
          )}
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Nenhuma conquista ainda</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
              Acesse o painel diariamente e crie projetos para começar a ganhar XP!
            </p>
          </div>
        ) : (
          <>
            <ol className="relative space-y-2.5 pl-5 before:content-[''] before:absolute before:left-[14px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-purple-500/30 before:to-transparent">
              {visibleEvents.map((event, idx) => {
                const { Icon, color, bg, border, glow } = getEventStyle(event);
                const Custom = event.type === "badge" && event.badgeId
                  ? (BADGE_ICON_MAP[data.badges.find(b => b.id === event.badgeId)?.icon || ""] || Icon)
                  : Icon;
                return (
                  <li
                    key={event.id}
                    className="relative animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                    data-voice={`${event.title}. ${timeAgo(event.createdAt)}`}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-5 top-2 w-7 h-7 rounded-full flex items-center justify-center border shadow-lg",
                      bg, border, glow
                    )}>
                      <Custom className={cn("h-3.5 w-3.5", color)} />
                    </div>

                    <div className={cn(
                      "ml-5 rounded-lg border bg-card/60 backdrop-blur-sm p-2.5 transition-all duration-300 hover:border-primary/40 hover:bg-card/80 hover:translate-x-0.5",
                      "border-border/50"
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground leading-snug">{event.title}</p>
                          {event.description && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{event.description}</p>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                          {timeAgo(event.createdAt)}
                        </span>
                      </div>

                      {(event.xp || event.coins || event.level) && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {event.xp ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                              <Sparkles className="h-2.5 w-2.5" /> +{event.xp} XP
                            </span>
                          ) : null}
                          {event.coins ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded-full">
                              <Coins className="h-2.5 w-2.5" /> +{event.coins}
                            </span>
                          ) : null}
                          {event.level ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full">
                              <TrendingUp className="h-2.5 w-2.5" /> Nível {event.level}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {events.length > 5 && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1.5 rounded-lg hover:bg-primary/5"
                data-voice={expanded ? "Mostrar menos" : `Ver todos os ${events.length} eventos`}
              >
                {expanded ? (
                  <>Mostrar menos <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <>Ver todos ({events.length}) <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
