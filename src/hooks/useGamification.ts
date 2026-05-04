/**
 * ============================================================
 * useGamification — Sistema de Gamificação do Painel
 * ============================================================
 * Gerencia XP, nível, moedas, conquistas (badges) e feed de
 * atividades de cada usuário, persistindo no localStorage
 * (chave gamatec_gamification_<userId>).
 *
 * Conceitos:
 *  - XP por nível: 500 (curva linear, fácil de entender).
 *  - Bônus de login diário: +25 XP / +5 moedas (1x por dia).
 *  - addXp(amount, coins?, motivo?): registra ganho e checa
 *    se o usuário subiu de nível.
 *  - unlockBadge(id): destrava conquista pontual.
 *  - syncFromActivity({totalProjects, publishedProjects}):
 *    destrava badges de marco baseados em dados reais.
 *
 * Tudo é client-side, sem migração no banco — fácil de
 * portar para Supabase no futuro se desejado.
 * ============================================================
 */
import { useEffect, useState, useCallback } from "react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  unlocked: boolean;
  unlockedAt?: string;
}

export type ActivityType = "xp" | "coins" | "badge" | "level_up" | "daily_login";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  xp?: number;
  coins?: number;
  badgeId?: string;
  level?: number;
  createdAt: string;
}

export interface GamificationData {
  xp: number;
  level: number;
  coins: number;
  badges: Badge[];
  lastDailyLogin?: string;
  activity: ActivityEvent[];
}

const STORAGE_PREFIX = "gamatec_gamification_";
const MAX_ACTIVITY = 50;

// XP curve: 500 XP per level (linear keeps things readable)
export const XP_PER_LEVEL = 500;

const DEFAULT_BADGES: Badge[] = [
  { id: "first_project", name: "Primeiro Projeto", description: "Sua jornada começou!", icon: "Rocket", unlocked: false },
  { id: "active_client", name: "Cliente Ativo", description: "Acessou o painel 5 dias", icon: "Flame", unlocked: false },
  { id: "completed", name: "100% Concluído", description: "Finalizou um projeto", icon: "Trophy", unlocked: false },
  { id: "explorer", name: "Explorador", description: "Visitou todas as áreas", icon: "Compass", unlocked: false },
];

const DEFAULT_DATA: GamificationData = {
  xp: 240,
  level: 3,
  coins: 120,
  badges: DEFAULT_BADGES,
  activity: [],
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadData(userId: string): GamificationData {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    if (!raw) return { ...DEFAULT_DATA, badges: DEFAULT_BADGES.map(b => ({ ...b })), activity: [] };
    const parsed = JSON.parse(raw) as GamificationData;
    const merged = DEFAULT_BADGES.map(def => parsed.badges?.find(b => b.id === def.id) || def);
    return { ...DEFAULT_DATA, ...parsed, badges: merged, activity: parsed.activity || [] };
  } catch {
    return { ...DEFAULT_DATA, badges: DEFAULT_BADGES.map(b => ({ ...b })), activity: [] };
  }
}

function saveData(userId: string, data: GamificationData) {
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function pushActivity(data: GamificationData, event: Omit<ActivityEvent, "id" | "createdAt">): GamificationData {
  const newEvent: ActivityEvent = { ...event, id: uid(), createdAt: new Date().toISOString() };
  const activity = [newEvent, ...data.activity].slice(0, MAX_ACTIVITY);
  return { ...data, activity };
}

export function calcLevel(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  const percent = (xpInLevel / XP_PER_LEVEL) * 100;
  return { level, xpInLevel, xpToNext, percent };
}

export function useGamification(userId: string | undefined) {
  const [data, setData] = useState<GamificationData>(DEFAULT_DATA);
  const [recentXp, setRecentXp] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    let loaded = loadData(userId);

    // Daily login bonus
    const today = new Date().toDateString();
    if (loaded.lastDailyLogin !== today) {
      const prevLevel = calcLevel(loaded.xp).level;
      loaded.xp += 25;
      loaded.coins += 5;
      loaded.lastDailyLogin = today;
      const newLevel = calcLevel(loaded.xp).level;
      loaded.level = newLevel;
      loaded = pushActivity(loaded, {
        type: "daily_login",
        title: "Login diário",
        description: "Bônus por acessar o painel hoje",
        xp: 25,
        coins: 5,
      });
      if (newLevel > prevLevel) {
        loaded = pushActivity(loaded, {
          type: "level_up",
          title: `Subiu para o Nível ${newLevel}!`,
          description: "Continue assim para desbloquear recompensas",
          level: newLevel,
        });
      }
      saveData(userId, loaded);
      setRecentXp(25);
      setTimeout(() => setRecentXp(null), 2500);
    }
    setData(loaded);
  }, [userId]);

  const addXp = useCallback((amount: number, coinsAmount = 0, reason?: string) => {
    if (!userId) return;
    setData(prev => {
      const prevLevel = calcLevel(prev.xp).level;
      let next: GamificationData = { ...prev, xp: prev.xp + amount, coins: prev.coins + coinsAmount };
      const newLevel = calcLevel(next.xp).level;
      next.level = newLevel;
      next = pushActivity(next, {
        type: "xp",
        title: reason || "XP ganho",
        xp: amount,
        coins: coinsAmount || undefined,
      });
      if (newLevel > prevLevel) {
        next = pushActivity(next, {
          type: "level_up",
          title: `Subiu para o Nível ${newLevel}!`,
          level: newLevel,
        });
      }
      saveData(userId, next);
      return next;
    });
    setRecentXp(amount);
    setTimeout(() => setRecentXp(null), 2500);
  }, [userId]);

  const unlockBadge = useCallback((badgeId: string) => {
    if (!userId) return;
    setData(prev => {
      const target = prev.badges.find(b => b.id === badgeId);
      if (!target || target.unlocked) return prev;
      const badges = prev.badges.map(b =>
        b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b
      );
      let next: GamificationData = { ...prev, badges };
      next = pushActivity(next, {
        type: "badge",
        title: `Conquista desbloqueada: ${target.name}`,
        description: target.description,
        badgeId: target.id,
      });
      saveData(userId, next);
      return next;
    });
  }, [userId]);

  // Sync badges based on real activity
  const syncFromActivity = useCallback((opts: { totalProjects: number; publishedProjects: number }) => {
    if (!userId) return;
    setData(prev => {
      let changed = false;
      let next = { ...prev };
      const badges = prev.badges.map(b => {
        if (b.id === "first_project" && opts.totalProjects >= 1 && !b.unlocked) {
          changed = true;
          next = pushActivity(next, {
            type: "badge",
            title: `Conquista desbloqueada: ${b.name}`,
            description: b.description,
            badgeId: b.id,
          });
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        if (b.id === "completed" && opts.publishedProjects >= 1 && !b.unlocked) {
          changed = true;
          next = pushActivity(next, {
            type: "badge",
            title: `Conquista desbloqueada: ${b.name}`,
            description: b.description,
            badgeId: b.id,
          });
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return b;
      });
      if (!changed) return prev;
      next = { ...next, badges };
      saveData(userId, next);
      return next;
    });
  }, [userId]);

  const levelInfo = calcLevel(data.xp);

  return { data, levelInfo, recentXp, addXp, unlockBadge, syncFromActivity };
}
