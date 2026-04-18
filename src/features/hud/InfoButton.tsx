import { useEffect, useState } from 'react';
import { RightPanel } from './RightPanel';

export function InfoButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[700] lg:hidden rounded-full flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          fontSize: 24,
          background: 'linear-gradient(180deg, #ffcf6b, #ff9f43)',
          color: 'white',
          boxShadow: '0 6px 16px rgba(90,70,54,0.3)',
          border: '2px solid #fff',
        }}
        aria-label="公司資訊"
      >
        📊
      </button>
      {open && (
        <>
          <style>{`@keyframes infoDrawerSlide{from{transform:translateX(100%);}to{transform:translateX(0);}}`}</style>
          <div
            className="fixed inset-0 z-[800] bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed right-0 top-0 bottom-0 z-[801] p-3 overflow-y-auto lg:hidden"
            style={{
              width: 'min(100vw, 380px)',
              animation: 'infoDrawerSlide 0.25s ease-out',
            }}
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-1.5 rounded-full"
                style={{ background: '#eeeae4', color: '#5b3c2b' }}
              >
                關閉 ✕
              </button>
            </div>
            <RightPanel />
          </div>
        </>
      )}
    </>
  );
}
