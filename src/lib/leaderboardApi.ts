import type { LeaderboardEntry } from '@/types';
import { apiFetch, ApiError, NetworkError, TimeoutError } from './api';

// ---- 後端資料模型 ----
type ServerEntry = {
  id: number;
  user_id: number;
  nickname: string;
  days: number;
  money: number;
  goal: number;
  office_level: number;
  staff_count: number;
  submitted_at: string;
};

type MyBest = {
  rank: number;
  entry: ServerEntry;
};

type ListResponse = {
  entries: ServerEntry[];
  my_best?: MyBest | null;
};

type MyListResponse = { entries: ServerEntry[] };

type SubmitResponse = { id: number; rank: number; total: number };

export type SubmitPayload = {
  days: number;
  money: number;
  goal: number;
  office_level: number;
  staff_count: number;
};

export type MyBestResult = {
  rank: number;
  entry: LeaderboardEntry;
};

function toClient(e: ServerEntry): LeaderboardEntry {
  return {
    days: e.days,
    money: e.money,
    goal: e.goal,
    officeLevel: e.office_level,
    staffCount: e.staff_count,
    date: e.submitted_at,
    nickname: e.nickname,
  };
}

export async function fetchLeaderboard(
  goal = 50000,
  limit = 10,
  withAuth = false,
): Promise<{ entries: LeaderboardEntry[]; myBest: MyBestResult | null }> {
  const qs = new URLSearchParams({ goal: String(goal), limit: String(limit) }).toString();
  const res = await apiFetch<ListResponse>(`/leaderboard?${qs}`, { auth: withAuth });
  const entries = (res.entries ?? []).map(toClient);
  const myBest = res.my_best
    ? { rank: res.my_best.rank, entry: toClient(res.my_best.entry) }
    : null;
  return { entries, myBest };
}

export async function fetchMyLeaderboard(goal?: number, limit = 20): Promise<LeaderboardEntry[]> {
  const params: Record<string, string> = { limit: String(limit) };
  if (goal !== undefined) params.goal = String(goal);
  const qs = new URLSearchParams(params).toString();
  const res = await apiFetch<MyListResponse>(`/leaderboard/me?${qs}`, { auth: true });
  return (res.entries ?? []).map(toClient);
}

export async function submitLeaderboard(payload: SubmitPayload): Promise<SubmitResponse> {
  return apiFetch<SubmitResponse>('/leaderboard', { method: 'POST', body: payload, auth: true });
}

export function isIgnorableApiError(err: unknown): boolean {
  if (err instanceof NetworkError || err instanceof TimeoutError) return true;
  if (err instanceof ApiError && err.status >= 500) return true;
  return false;
}
