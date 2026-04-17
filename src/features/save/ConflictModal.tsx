import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';

export function ConflictModal() {
  const status = useSaveStore((s) => s.status);
  const conflict = useSaveStore((s) => s.conflict);
  const resolveConflict = useSaveStore((s) => s.resolveConflict);
  const localDay = useGameStore((s) => s.day);
  const localMoney = useGameStore((s) => s.money);
  const localStaffLen = useGameStore((s) => s.staff.length);
  const [busy, setBusy] = useState(false);

  if (status !== 'conflict' || !conflict) return null;

  const serverData = conflict.server_data;

  async function choose(choice: 'local' | 'cloud') {
    if (busy) return;
    setBusy(true);
    try {
      await resolveConflict(choice);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[950] bg-black/60 flex items-center justify-center p-5">
      <div
        className="max-w-md w-full rounded-3xl p-6"
        style={{ background: '#fffaf0', border: '2px solid rgba(90,70,54,0.12)' }}
      >
        <div className="text-2xl font-extrabold mb-2" style={{ color: '#5b3c2b' }}>
          🐕 存檔衝突
        </div>
        <p className="text-sm mb-4" style={{ color: '#7a685a' }}>
          雲端的存檔與本地不同步，可能是在其他分頁或裝置玩過。請選擇要保留哪一份：
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div
            className="rounded-2xl p-3"
            style={{ background: 'white', border: '2px solid rgba(90,70,54,0.15)' }}
          >
            <div className="text-xs font-bold mb-1.5" style={{ color: '#7a685a' }}>
              🟡 本地
            </div>
            <div className="text-sm">第 {localDay} 天</div>
            <div className="text-sm">${localMoney}</div>
            <div className="text-sm">{localStaffLen} 位員工</div>
          </div>
          <div
            className="rounded-2xl p-3"
            style={{ background: 'white', border: '2px solid rgba(90,70,54,0.15)' }}
          >
            <div className="text-xs font-bold mb-1.5" style={{ color: '#7a685a' }}>
              ☁️ 雲端
            </div>
            <div className="text-sm">第 {serverData.day} 天</div>
            <div className="text-sm">${serverData.money}</div>
            <div className="text-sm">{serverData.staff.length} 位員工</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => choose('local')}
            disabled={busy}
            className="py-2.5 rounded-full font-extrabold text-sm"
            style={{
              background: 'linear-gradient(180deg, #ffcf6b, #ff9f43)',
              color: 'white',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            保留本地，覆蓋雲端
          </button>
          <button
            onClick={() => choose('cloud')}
            disabled={busy}
            className="py-2.5 rounded-full font-extrabold text-sm"
            style={{
              background: 'linear-gradient(180deg, #c0b8ac, #8e8578)',
              color: 'white',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            讀取雲端，覆蓋本地
          </button>
        </div>
      </div>
    </div>
  );
}
