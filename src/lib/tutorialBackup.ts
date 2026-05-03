// 教學步數本地備份：雲端 save 因競爭/網路掉時的安全網。
// 雲端 saveToCloud 會被頁面 reload 中斷，或被同一 revision 的多 POST 競爭蓋掉，
// 而教學步數變更頻繁又「不能倒退」，所以單獨用 localStorage 同步寫一份。
//
// 重要：備份要帶 savedAt 時間戳，loadCloud 時才能跟雲端 updated_at 比新舊；
// 否則上一局殘留的舊備份會 leapfrog 當前進度（例如把 step 5 的玩家直接推到 step 7）。

const PREFIX = 'dogoffice:tutorialStep:';

export type TutorialBackup = {
  step: number;
  savedAt: number; // Date.now()
};

export function tutorialBackupKey(userId: number | string): string {
  return `${PREFIX}${userId}`;
}

export function writeTutorialBackup(userId: number | string, step: number): void {
  try {
    const payload: TutorialBackup = { step, savedAt: Date.now() };
    localStorage.setItem(tutorialBackupKey(userId), JSON.stringify(payload));
  } catch {
    // ignore（無痕模式 / 配額滿等）
  }
}

export function readTutorialBackup(userId: number | string): TutorialBackup | null {
  try {
    const raw = localStorage.getItem(tutorialBackupKey(userId));
    if (raw == null) return null;
    // 舊格式（純數字字串）相容：當作非常舊的備份，savedAt = 0
    const trimmed = raw.trim();
    if (/^-?\d+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      return Number.isFinite(n) ? { step: n, savedAt: 0 } : null;
    }
    const obj = JSON.parse(raw) as Partial<TutorialBackup>;
    if (typeof obj.step !== 'number' || !Number.isFinite(obj.step)) return null;
    const savedAt = typeof obj.savedAt === 'number' && Number.isFinite(obj.savedAt) ? obj.savedAt : 0;
    return { step: obj.step, savedAt };
  } catch {
    return null;
  }
}

export function clearTutorialBackup(userId: number | string): void {
  try {
    localStorage.removeItem(tutorialBackupKey(userId));
  } catch {
    // ignore
  }
}
