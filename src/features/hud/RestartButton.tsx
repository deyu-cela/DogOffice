import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { useGameStore } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';

export function RestartButton() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const restart = useGameStore((s) => s.restart);

  async function doRestart() {
    if (busy) return;
    setBusy(true);
    try {
      await useSaveStore.getState().clearCloud();
      restart();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 rounded-full"
        style={{
          background: 'transparent',
          color: '#7a685a',
          border: '1px solid rgba(90,70,54,0.15)',
          cursor: 'pointer',
        }}
      >
        <span className="flex items-center gap-1.5">
          <Icon name="refresh" size={14} />
          <span>重來</span>
        </span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[920] bg-black/60 flex items-center justify-center p-5">
          <div
            className="max-w-sm w-full rounded-3xl p-6"
            style={{ background: '#fffaf0', border: '2px solid rgba(90,70,54,0.12)' }}
          >
            <div className="text-xl font-extrabold mb-2" style={{ color: '#5b3c2b' }}>
              重新開始？
            </div>
            <p className="text-sm mb-5" style={{ color: '#7a685a' }}>
              目前的公司會被解散，雲端存檔也會刪除。確定要從頭開始嗎？
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="flex-1 py-2 rounded-full text-sm font-bold"
                style={{ background: '#eeeae4', color: '#5b3c2b', cursor: busy ? 'wait' : 'pointer' }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={doRestart}
                disabled={busy}
                className="flex-1 py-2 rounded-full font-extrabold text-sm"
                style={{
                  background: busy ? '#c9a57b' : 'linear-gradient(180deg, #ff8a8a, #d75d5d)',
                  color: 'white',
                  cursor: busy ? 'wait' : 'pointer',
                }}
              >
                {busy ? '處理中…' : '確定重來'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
