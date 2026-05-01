import type { LeaderboardEntry } from '@/types';
import { apiFetch, ApiError, NetworkError, TimeoutError } from './api';

// ---- 後端資料模型 ----
// 後端尚未 migrate 到新 schema，欄位都標 optional 防 undefined 噴
type ServerEntry = {
  id?: number;
  user_id?: number;
  nickname?: string;
  damage?: number;
  team_size?: number;
  days?: number;
  money?: number;
  goal?: number;
  office_level?: number;
  staff_count?: number;
  projects_completed?: number;
  submitted_at?: string;
};

type Me = {
  rank: number;
  entry: ServerEntry;
};

type ListResponse = {
  entries: ServerEntry[];
  me?: Me | null;
};

type SubmitResponse = { id: number; rank: number; total: number };

export type SubmitPayload = {
  damage: number;
  team_size: number;
};

export type MyBestResult = {
  rank: number;
  entry: LeaderboardEntry;
};

function toClient(e: ServerEntry): LeaderboardEntry {
  return {
    damage: typeof e.damage === 'number' ? e.damage : 0,
    teamSize: typeof e.team_size === 'number' ? e.team_size : 0,
    days: typeof e.days === 'number' ? e.days : undefined,
    money: typeof e.money === 'number' ? e.money : undefined,
    goal: typeof e.goal === 'number' ? e.goal : undefined,
    officeLevel: typeof e.office_level === 'number' ? e.office_level : undefined,
    staffCount: typeof e.staff_count === 'number' ? e.staff_count : undefined,
    projectsCompleted: typeof e.projects_completed === 'number' ? e.projects_completed : undefined,
    date: e.submitted_at ?? new Date().toISOString(),
    nickname: e.nickname,
  };
}

function isValidEntry(e: LeaderboardEntry): boolean {
  // 過濾掉舊 schema 殘留：沒有 damage 的條目不顯示
  return e.damage > 0;
}

export async function fetchLeaderboard(
  limit = 10,
  withAuth = false,
): Promise<{ entries: LeaderboardEntry[]; myBest: MyBestResult | null }> {
  const qs = new URLSearchParams({ limit: String(limit) }).toString();
  const res = await apiFetch<ListResponse>(`/leaderboard?${qs}`, { auth: withAuth });
  const entries = (res.entries ?? []).map(toClient).filter(isValidEntry);
  const myBestEntry = res.me ? toClient(res.me.entry) : null;
  const myBest = myBestEntry && isValidEntry(myBestEntry)
    ? { rank: res.me!.rank, entry: myBestEntry }
    : null;
  return { entries, myBest };
}

export async function submitLeaderboard(payload: SubmitPayload): Promise<SubmitResponse> {
  return apiFetch<SubmitResponse>('/leaderboard', { method: 'POST', body: payload, auth: true });
}

export function isIgnorableApiError(err: unknown): boolean {
  if (err instanceof NetworkError || err instanceof TimeoutError) return true;
  if (err instanceof ApiError && err.status >= 500) return true;
  return false;
}

// ---- 本機紀錄 ----
const LB_KEY = 'dogoffice_crisis_v1';
const LB_KEEP_TOP = 20;

export function loadLocal(): LeaderboardEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveLocal(list: LeaderboardEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function saveLocalEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const list = loadLocal();
  list.push(entry);
  list.sort(compareEntries);
  const top = list.slice(0, LB_KEEP_TOP);
  saveLocal(top);
  return top;
}

export function bestLocal(entries: LeaderboardEntry[]): LeaderboardEntry | null {
  if (entries.length === 0) return null;
  return [...entries].sort(compareEntries)[0];
}

function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  return b.damage - a.damage || b.teamSize - a.teamSize;
}
