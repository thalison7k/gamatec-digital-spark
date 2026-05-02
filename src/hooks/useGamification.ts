import { useEffect, useState, useCallback } from "react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GamificationData {
  xp: number;
  level: number;
  coins: number;
  badges: Badge[];
  lastDailyLogin?: string;
}

const STORAGE_PREFIX = "gamatec_gamification_";

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
};

function loadData(userId: string): GamificationData {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    if (!raw) return { ...DEFAULT_DATA, badges: DEFAULT_BADGES.map(b => ({ ...b })) };
    const parsed = JSON.parse(raw) as GamificationData;
    // ensure all default badges exist (forward-compatible)
    const merged = DEFAULT_BADGES.map(def => parsed.badges?.find(b => b.id === def.id) || def);
    return { ...DEFAULT_DATA, ...parsed, badges: merged };
  } catch {
    return { ...DEFAULT_DATA, badges: DEFAULT_BADGES.map(b => ({ ...b })) };
  }
}

function saveData(userId: string, data: GamificationData) {
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(data));
  } catch {
    // ignore
  }
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
    const loaded = loadData(userId);

    // Daily login bonus
    const today = new Date().toDateString();
    if (loaded.lastDailyLogin !== today) {
      loaded.xp += 25;
      loaded.coins += 5;
      loaded.lastDailyLogin = today;
      const { level } = calcLevel(loaded.xp);
      loaded.level = level;
      saveData(userId, loaded);
      setRecentXp(25);
      setTimeout(() => setRecentXp(null), 2500);
    }
    setData(loaded);
  }, [userId]);

  const addXp = useCallback((amount: number, coinsAmount = 0) => {
    if (!userId) return;
    setData(prev => {
      const next = { ...prev, xp: prev.xp + amount, coins: prev.coins + coinsAmount };
      next.level = calcLevel(next.xp).level;
      saveData(userId, next);
      return next;
    });
    setRecentXp(amount);
    setTimeout(() => setRecentXp(null), 2500);
  }, [userId]);

  const unlockBadge = useCallback((badgeId: string) => {
    if (!userId) return;
    setData(prev => {
      if (prev.badges.find(b => b.id === badgeId)?.unlocked) return prev;
      const badges = prev.badges.map(b =>
        b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b
      );
      const next = { ...prev, badges };
      saveData(userId, next);
      return next;
    });
  }, [userId]);

  // Sync badges based on real activity
  const syncFromActivity = useCallback((opts: { totalProjects: number; publishedProjects: number }) => {
    if (!userId) return;
    setData(prev => {
      const badges = prev.badges.map(b => {
        if (b.id === "first_project" && opts.totalProjects >= 1 && !b.unlocked) {
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        if (b.id === "completed" && opts.publishedProjects >= 1 && !b.unlocked) {
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return b;
      });
      if (badges.every((b, i) => b.unlocked === prev.badges[i].unlocked)) return prev;
      const next = { ...prev, badges };
      saveData(userId, next);
      return next;
    });
  }, [userId]);

  const levelInfo = calcLevel(data.xp);

  return { data, levelInfo, recentXp, addXp, unlockBadge, syncFromActivity };
}
