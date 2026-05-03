import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Rocket, Flame, Trophy, Compass, Coins, Sparkles, Zap, Star, Lock, Gift, Crown, TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";

interface BadgeStyle {
  Icon: any;
  gradient: string;
  border: string;
  glow: string;
  iconColor: string;
  ring: string;
}

const BADGE_STYLES: Record<string, BadgeStyle> = {
  Rocket: {
    Icon: Rocket,
    gradient: "from-blue-500/30 via-cyan-400/20 to-blue-600/30",
    border: "border-blue-400/60",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.5)]",
    iconColor: "text-blue-300",
    ring: "ring-blue-400/40",
  },
  Flame: {
    Icon: Flame,
    gradient: "from-orange-500/30 via-red-500/20 to-pink-500/30",
    border: "border-orange-400/60",
    glow: "shadow-[0_0_25px_rgba(249,115,22,0.5)]",
    iconColor: "text-orange-300",
    ring: "ring-orange-400/40",
  },
  Trophy: {
    Icon: Trophy,
    gradient: "from-yellow-400/30 via-amber-500/20 to-orange-400/30",
    border: "border-yellow-400/60",
    glow: "shadow-[0_0_25px_rgba(250,204,21,0.5)]",
    iconColor: "text-yellow-300",
    ring: "ring-yellow-400/40",
  },
  Compass: {
    Icon: Compass,
    gradient: "from-purple-500/30 via-fuchsia-500/20 to-pink-500/30",
    border: "border-purple-400/60",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.5)]",
    iconColor: "text-purple-300",
    ring: "ring-purple-400/40",
  },
};

interface Props {
  totalProjects: number;
  publishedProjects: number;
}

const ProgressCard = ({ totalProjects, publishedProjects }: Props) => {
  const { user } = useAuth();
  const { data, levelInfo, recentXp, syncFromActivity } = useGamification(user?.id);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [pulseStar, setPulseStar] = useState(false);

  useEffect(() => {
    syncFromActivity({ totalProjects, publishedProjects });
  }, [totalProjects, publishedProjects, syncFromActivity]);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedPercent(levelInfo.percent), 200);
    return () => clearTimeout(t);
  }, [levelInfo.percent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseStar(true);
      setTimeout(() => setPulseStar(false), 600);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const unlockedCount = data.badges.filter(b => b.unlocked).length;
  const nextReward = unlockedCount < data.badges.length
    ? data.badges.find(b => !b.unlocked)
    : null;

  const rankingPercent = Math.max(5, 100 - data.level * 12);

  return (
    <Card
      className="border-2 border-primary/20 overflow-hidden relative group bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-purple-950/90 dark:from-slate-900/90 dark:via-slate-900/95 dark:to-purple-950/90 shadow-2xl shadow-primary/10 hover:shadow-primary/30 transition-shadow duration-500"
      data-voice={`Seu Progresso. Nível ${levelInfo.level}. ${data.xp} de XP. ${data.coins} GamaCoins.`}
    >
      {/* Animated background orbs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDuration: "4s" }} />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-40" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* XP gain feedback */}
      {recentXp !== null && (
        <div
          className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-gradient-to-r from-primary to-cyan-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_25px_hsl(var(--primary)/0.7)] animate-in fade-in slide-in-from-top-2 zoom-in duration-500"
          style={{ animationFillMode: "both" }}
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          +{recentXp} XP
        </div>
      )}

      <CardContent className="p-5 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-xl blur-md opacity-70 animate-pulse" style={{ animationDuration: "2s" }} />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-cyan-400 to-purple-500 flex items-center justify-center shadow-xl">
                <Zap className="h-5 w-5 text-white drop-shadow-lg" fill="white" />
              </div>
            </div>
            <div>
              <h3 className="font-orbitron text-base font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                Seu Progresso
              </h3>
              <p className="text-[10px] text-cyan-300/80 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="h-2.5 w-2.5" />
                Top {rankingPercent}% dos clientes
              </p>
            </div>
          </div>

          {/* Coins */}
          <div className="relative group/coins">
            <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-md opacity-70 group-hover/coins:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/50 rounded-full px-3 py-1.5 shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform">
              <Coins className="h-4 w-4 text-yellow-300 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]" />
              <span className="text-sm font-bold text-yellow-200 font-orbitron">{data.coins}</span>
              <span className="text-[10px] text-yellow-300/80 uppercase tracking-wider font-semibold">GamaCoins</span>
            </div>
          </div>
        </div>

        {/* Level + XP bar */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-cyan-300/70 uppercase tracking-wider font-semibold">Nível</span>
              <span className="text-4xl font-orbitron font-black bg-gradient-to-r from-cyan-300 via-primary to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]">
                {levelInfo.level}
              </span>
              <Star className={cn(
                "h-5 w-5 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] transition-transform duration-500",
                pulseStar && "scale-150 rotate-180"
              )} />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                {levelInfo.xpInLevel} <span className="text-cyan-300/60 text-xs">/ 500 XP</span>
              </div>
              <div className="text-[10px] text-cyan-300/60">
                Faltam <span className="text-primary font-bold">{levelInfo.xpToNext} XP</span> p/ nível {levelInfo.level + 1}
              </div>
            </div>
          </div>

          {/* Enhanced progress bar */}
          <div className="relative h-4 rounded-full bg-slate-800/80 overflow-hidden border border-white/10 shadow-inner">
            {/* Track segments */}
            <div className="absolute inset-0 flex">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex-1 border-r border-white/5 last:border-0" />
              ))}
            </div>
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-primary to-purple-500 rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_20px_hsl(var(--primary)/0.8)]"
              style={{ width: `${animatedPercent}%` }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            {/* Sparkle at the end */}
            {animatedPercent > 5 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full blur-sm animate-pulse"
                style={{ left: `${animatedPercent}%` }}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-cyan-300/70 font-semibold">{Math.round(levelInfo.percent)}% do nível</span>
            <span className="flex items-center gap-1 text-primary font-semibold">
              <Sparkles className="h-3 w-3" />
              +25 XP por login diário
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-cyan-300/80 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Crown className="h-3 w-3 text-yellow-300" />
              Conquistas <span className="text-white">({unlockedCount}/{data.badges.length})</span>
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {data.badges.map((badge) => {
              const style = BADGE_STYLES[badge.icon] || BADGE_STYLES.Trophy;
              const Icon = style.Icon;
              return (
                <div
                  key={badge.id}
                  title={`${badge.name} — ${badge.description}`}
                  data-voice={`${badge.name}. ${badge.unlocked ? "Desbloqueado." : "Bloqueado."} ${badge.description}`}
                  className={cn(
                    "group/badge relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 p-2 transition-all duration-500 cursor-help overflow-hidden min-h-[88px]",
                    badge.unlocked
                      ? cn("bg-gradient-to-br", style.gradient, style.border, style.glow, "hover:scale-110 hover:-rotate-2")
                      : "bg-slate-800/40 border-dashed border-slate-600/40 opacity-50 hover:opacity-80"
                  )}
                >
                  {/* Inner shine */}
                  {badge.unlocked && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-white/10 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500" />
                    </>
                  )}

                  {badge.unlocked ? (
                    <>
                      <div className="relative z-10">
                        <div className="absolute inset-0 blur-lg opacity-60 rounded-full" style={{ background: "currentColor" }} />
                        <Icon className={cn("relative h-7 w-7 drop-shadow-[0_0_10px_currentColor] group-hover/badge:scale-125 transition-transform duration-300", style.iconColor)} />
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-center leading-tight font-black text-white relative z-10 drop-shadow-md px-0.5">
                        {badge.name.split(" ")[0]}
                      </span>
                      {/* Unlocked indicator with pulse */}
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-400 border-2 border-slate-900 shadow-[0_0_12px_rgba(74,222,128,0.9)] z-20">
                        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 text-slate-500" />
                      <span className="text-[9px] uppercase tracking-wider text-center leading-tight font-semibold text-slate-500 px-0.5">
                        {badge.name.split(" ")[0]}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next reward */}
        {nextReward && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-3 group/reward hover:bg-white/5 -mx-2 px-3 py-2 rounded-xl transition-all cursor-pointer">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-primary rounded-xl blur-md opacity-60 group-hover/reward:opacity-100 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-primary/30 border border-primary/50 flex items-center justify-center group-hover/reward:scale-110 group-hover/reward:rotate-12 transition-transform duration-300">
                  <Gift className="h-5 w-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.8)]" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-cyan-300/70 uppercase tracking-wider font-bold">Próxima recompensa</p>
                <p className="text-sm font-bold text-white truncate">{nextReward.name}</p>
              </div>
              <span className="text-xs text-primary font-black whitespace-nowrap bg-primary/15 px-2.5 py-1 rounded-full border border-primary/30">+50 XP</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
