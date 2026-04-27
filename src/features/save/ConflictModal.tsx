import { useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
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
    <div className="fixed inset-0 z-[950] bg-[#08204d]/60 backdrop-blur-sm flex items-center justify-center p-5">
      <div
        className="max-w-md w-full rounded-xl p-6"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
      >
        <div className="flex items-center gap-2 text-2xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>
          <SvgIcon name="save" size={30} />
          <span>存檔衝突</span>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          雲端的存檔與本地不同步，可能是在其他分頁或裝置玩過。請選擇要保留哪一份：
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <SaveSnapshot title="本地" day={localDay} money={localMoney} staffCount={localStaffLen} />
          <SaveSnapshot title="雲端" day={serverData.day} money={serverData.money} staffCount={serverData.staff.length} blue />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => choose('local')}
            disabled={busy}
            className="py-2.5 rounded-lg font-extrabold text-sm"
            style={{
              background: 'linear-gradient(180deg, #2f8df4, #1c63c8)',
              color: 'white',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            保留本地，覆蓋雲端
          </button>
          <button
            onClick={() => choose('cloud')}
            disabled={busy}
            className="py-2.5 rounded-lg font-extrabold text-sm"
            style={{
              background: '#ffffff',
              color: 'var(--blue)',
              border: '1px solid var(--line)',
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

function SaveSnapshot({ title, day, money, staffCount, blue = false }: { title: string; day: number; money: number; staffCount: number; blue?: boolean }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: blue ? '#f7fbff' : '#ffffff', border: '1px solid var(--line)' }}
    >
      <div className="text-xs font-bold mb-1.5" style={{ color: 'var(--muted)' }}>
        {title}
      </div>
      <div className="text-sm">第 {day} 天</div>
      <div className="text-sm">${money}</div>
      <div className="text-sm">{staffCount} 位員工</div>
    </div>
  );
}
