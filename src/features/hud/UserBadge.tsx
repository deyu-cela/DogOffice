import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';

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
      // 登出前先把當前進度存到雲端，避免遺失
      try {
        await useSaveStore.getState().saveToCloud();
      } catch {
        // 存檔失敗也繼續登出，不擋使用者
      }
      await logout();
      setShowSplash(true);
    } finally {
      setBusy(false);
    }
  }

  const avatarSrc = `${import.meta.env.BASE_URL}assets/dog-profiles/ceo.png`;

  return (
    <>
      <div
        className="flex h-12 max-w-[170px] items-center gap-2 rounded-xl px-3"
        style={{
          background: 'linear-gradient(180deg, #ffffff, #f4f9ff)',
          border: '1px solid rgba(121, 164, 224, 0.34)',
          boxShadow: '0 4px 12px rgba(46,104,180,0.1), inset 0 1px 0 rgba(255,255,255,0.95)',
        }}
        title={user.account}
      >
        <img
          src={avatarSrc}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          style={{
            border: '2px solid #dceafe',
            boxShadow: '0 2px 8px rgba(46,104,180,0.16)',
          }}
        />
        <span className="truncate text-sm font-extrabold" style={{ color: 'var(--text)' }}>
          {user.account}
        </span>
      </div>

      <button
        type="button"
        onClick={onLogout}
        disabled={busy}
        className="h-12 rounded-xl px-4 text-sm font-extrabold"
        style={{
          background: busy ? '#e9eef6' : 'linear-gradient(180deg, #ffffff, #f4f9ff)',
          color: 'var(--text)',
          border: '1px solid rgba(121, 164, 224, 0.34)',
          boxShadow: '0 4px 12px rgba(46,104,180,0.1), inset 0 1px 0 rgba(255,255,255,0.95)',
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? '...' : '登出'}
      </button>
    </>
  );
}
