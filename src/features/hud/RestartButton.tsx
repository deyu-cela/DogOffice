import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';
import { HangingClipButton } from './HangingClipButton';

const RESTART_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v5h-5" />
  </svg>
);

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
      <HangingClipButton
        bgColor="#ffe0c8"
        iconColor="#a86438"
        clipColor="#d8a888"
        tilt={3}
        hangY={1}
        icon={RESTART_ICON}
        label="重新開始"
        onClick={() => setOpen(true)}
      />
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
