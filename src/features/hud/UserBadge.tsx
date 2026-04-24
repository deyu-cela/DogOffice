import { useState } from 'react';
import { Icon } from '@/components/Icon';
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
      <span className="flex items-center gap-1.5" style={{ color: '#7a685a' }} title={user.account}>
        <Icon name="dog" size={14} style={{ color: '#c86f4b' }} />
        <span>{user.account}</span>
      </span>
      <button
        type="button"
        onClick={onLogout}
        disabled={busy}
        className="px-2.5 py-1 rounded-full text-xs font-bold"
        style={{
          background: busy ? '#e5d5c3' : 'linear-gradient(180deg, #fff0f3, #fbd5db)',
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
