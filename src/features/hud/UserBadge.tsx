import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';

export function UserBadge() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setShowSplash = useGameStore((s) => s.setShowSplash);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  async function onLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
      setShowSplash(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span style={{ color: '#7a685a' }} title={user.account}>
        🐶 {user.account}
      </span>
      <button
        type="button"
        onClick={onLogout}
        disabled={busy}
        className="px-2.5 py-1 rounded-full text-xs font-bold"
        style={{
          background: busy ? '#e5d5c3' : 'linear-gradient(180deg, #fff7dd, #ffe8bf)',
          color: '#7a685a',
          border: '1px solid rgba(90,70,54,0.12)',
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? '登出中…' : '登出'}
      </button>
    </div>
  );
}
