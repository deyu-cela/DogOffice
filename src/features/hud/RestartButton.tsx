import { useState } from 'react';
import { createPortal } from 'react-dom';
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
        className="grid h-12 w-12 place-items-center rounded-xl text-xl"
        style={{
          background: 'linear-gradient(180deg, #ffffff, #f4f9ff)',
          color: 'var(--text)',
          border: '1px solid rgba(121, 164, 224, 0.34)',
          boxShadow: '0 4px 12px rgba(46,104,180,0.1), inset 0 1px 0 rgba(255,255,255,0.95)',
        }}
        title="重新開始"
        aria-label="重新開始"
      >
        <RestartIcon />
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[920] flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm">
            <div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{
                background: 'linear-gradient(180deg, #ffffff, #f4f9ff)',
                border: '1px solid var(--line)',
                boxShadow: '0 24px 60px rgba(23,53,111,0.28)',
              }}
            >
              <div className="mb-2 text-xl font-extrabold" style={{ color: 'var(--text)' }}>
                重新開始遊戲？
              </div>
              <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                這會清除目前雲端存檔並建立一局新公司。這個動作無法復原。
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                  className="flex-1 rounded-xl py-2 text-sm font-bold"
                  style={{
                    background: '#eef6ff',
                    color: 'var(--text)',
                    border: '1px solid var(--line)',
                    boxShadow: 'none',
                    cursor: busy ? 'wait' : 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={doRestart}
                  disabled={busy}
                  className="flex-1 rounded-xl py-2 text-sm font-extrabold"
                  style={{
                    background: busy ? '#91a0b8' : 'linear-gradient(180deg, #ff7b7b, #ef5b5b)',
                    color: 'white',
                    border: '1px solid rgba(239,91,91,0.2)',
                    cursor: busy ? 'wait' : 'pointer',
                  }}
                >
                  {busy ? '處理中...' : '確認重開'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function RestartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="restart-icon-blue" x1="0" x2="0" y1="4" y2="28">
          <stop stopColor="#4f95ef" />
          <stop offset="1" stopColor="#1d5fb8" />
        </linearGradient>
      </defs>
      <path
        d="M23.8 9.2A10 10 0 1 0 25 20.5"
        fill="none"
        stroke="url(#restart-icon-blue)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M23.4 5.8v6.4H17"
        fill="none"
        stroke="url(#restart-icon-blue)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.2" fill="#ffd96a" stroke="#1d5fb8" strokeWidth="1.4" />
    </svg>
  );
}
