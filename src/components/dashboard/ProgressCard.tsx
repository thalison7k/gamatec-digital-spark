import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Rocket, Flame, Trophy, Compass, Coins, Sparkles, Zap, Star, Lock, Gift
} from "lucide-react";
import { useEffect, useState } from "react";

const ICON_MAP: Record<string, any> = { Rocket, Flame, Trophy, Compass };

interface Props {
  totalProjects: number;
  publishedProjects: number;
}

const ProgressCard = ({ totalProjects, publishedProjects }: Props) => {
  const { user } = useAuth();
  const { data, levelInfo, recentXp, syncFromActivity } = useGamification(user?.id);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    syncFromActivity({ totalProjects, publishedProjects });
  }, [totalProjects, publishedProjects, syncFromActivity]);

  // Animate progress bar fill on mount/change
  useEffect(() => {
    const t = setTimeout(() => setAnimatedPercent(levelInfo.percent), 150);
    return () => clearTimeout(t);
  }, [levelInfo.percent]);

  const unlockedCount = data.badges.filter(b => b.unlocked).length;
  const nextReward = unlockedCount < data.badges.length
    ? data.badges.find(b => !b.unlocked)
    : null;

  // Mock ranking position
  const rankingPercent = Math.max(5, 100 - data.level * 12);

  return (
    <Card
      className="border-border/50 overflow-hidden relative group"
      data-voice={`Seu Progresso. Nível ${levelInfo.level}. ${data.xp} de XP. ${data.coins} GamaCoins.`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-cyan-500/10 opacity-80" />
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

      {/* XP gain feedback */}
      {recentXp !== null && (
        <div
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-primary/40 animate-in fade-in slide-in-from-top-2 zoom-in duration-500"
          style={{ animationFillMode: "both" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          +{recentXp} XP
        </div>
      )}

      <CardContent className="p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm font-bold text-foreground">Seu Progresso</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Top {rankingPercent}% dos clientes</p>
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/30 rounded-full px-3 py-1.5 shadow-sm hover:scale-105 transition-transform">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400 font-orbitron">{data.coins}</span>
            <span className="text-[10px] text-yellow-400/70 uppercase tracking-wider">GamaCoins</span>
          </div>
        </div>

        {/* Level + XP bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Nível</span>
              <span className="text-3xl font-orbitron font-black bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {levelInfo.level}
              </span>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-foreground">
                {levelInfo.xpInLevel} <span className="text-muted-foreground">/ 500 XP</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Faltam {levelInfo.xpToNext} XP para nível {levelInfo.level + 1}
              </div>
            </div>
          </div>

          <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden border border-border/50 shadow-inner">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-purple-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
              style={{ width: `${animatedPercent}%` }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{Math.round(levelInfo.percent)}% do nível</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              +25 XP por login diário
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Conquistas ({unlockedCount}/{data.badges.length})
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {data.badges.map((badge) => {
              const Icon = ICON_MAP[badge.icon] || Trophy;
              return (
                <div
                  key={badge.id}
                  title={`${badge.name} — ${badge.description}`}
                  data-voice={`${badge.name}. ${badge.unlocked ? "Desbloqueado." : "Bloqueado."} ${badge.description}`}
                  className={cn(
                    "group/badge relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 p-2 transition-all duration-300 cursor-help",
                    badge.unlocked
                      ? "bg-gradient-to-br from-primary/15 to-purple-500/10 border-primary/40 hover:scale-110 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:border-primary"
                      : "bg-muted/30 border-border/30 opacity-50 hover:opacity-80"
                  )}
                >
                  {badge.unlocked ? (
                    <Icon className="h-5 w-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)] group-hover/badge:scale-110 transition-transform" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "text-[8px] uppercase tracking-wider text-center leading-tight font-semibold",
                    badge.unlocked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {badge.name.split(" ")[0]}
                  </span>
                  {badge.unlocked && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next reward */}
        {nextReward && (
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2.5 group/reward hover:bg-primary/5 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-primary/20 border border-primary/30 flex items-center justify-center shrink-0 group-hover/reward:scale-110 transition-transform">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Próxima recompensa</p>
              <p className="text-xs font-semibold text-foreground truncate">{nextReward.name}</p>
            </div>
            <span className="text-[10px] text-primary font-bold whitespace-nowrap">+50 XP</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
