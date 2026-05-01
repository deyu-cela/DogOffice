import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { ConstructionPanel } from '@/features/shop/ConstructionPanel';

const TITLE = {
  construction: '營建',
} as const;

const SUBTITLE = {
  construction: '擴建辦公室，提升員工上限與案件 tier 上限。',
} as const;

export function BuildingDrawer() {
  const kind = useUiStore((s) => s.openBuilding);
  const close = useUiStore((s) => s.closeDrawer);

  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [kind, close]);

  if (!kind) return null;

  return (
    <>
      <style>{`
        @keyframes drawerSlideDesktop {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes drawerSlideMobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .drawer-wrap {
          position: fixed;
          z-index: 801;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,249,255,0.95));
          border: 1px solid var(--line);
          box-shadow: 0 -14px 34px rgba(23,53,111,0.2);
          backdrop-filter: blur(12px);
        }
        @media (min-width: 768px) {
          .drawer-wrap {
            top: 0;
            right: 0;
            bottom: 0;
            width: min(100vw, 440px);
            border-top-left-radius: 24px;
            border-bottom-left-radius: 24px;
            animation: drawerSlideDesktop 0.25s ease-out;
            box-shadow: -12px 0 34px rgba(23,53,111,0.18);
          }
        }
        @media (max-width: 767px) {
          .drawer-wrap {
            left: 0;
            right: 0;
            bottom: 0;
            max-height: 85vh;
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
            animation: drawerSlideMobile 0.25s ease-out;
          }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[800] bg-slate-950/35 backdrop-blur-[2px]"
        onClick={close}
        style={{ animation: 'backdropFade 0.2s ease-out' }}
      />
      <div className="drawer-wrap p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-extrabold truncate">{TITLE[kind]}</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {SUBTITLE[kind]}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-sm px-3 py-1.5 rounded-xl whitespace-nowrap"
            style={{
              background: '#f4f9ff',
              color: 'var(--text)',
              border: '1px solid var(--line)',
              boxShadow: 'none',
            }}
          >
            關閉
          </button>
        </div>
        <div className="flex-1 overflow-y-auto mt-2 pr-1">
          {kind === 'construction' && <ConstructionPanel />}
        </div>
      </div>
    </>
  );
}
