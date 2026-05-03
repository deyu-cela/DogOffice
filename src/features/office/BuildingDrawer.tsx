import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { ConstructionPanel } from '@/features/shop/ConstructionPanel';

const TITLE = {
  construction: '擴建',
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
          background:
            linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,247,239,0.86)),
            repeating-linear-gradient(0deg, rgba(186,121,82,0.06) 0 1px, transparent 1px 18px),
            #f7d6bf;
          border: 1px solid rgba(208,130,105,0.38);
          box-shadow: 0 -14px 34px rgba(72,40,34,0.18);
          backdrop-filter: blur(12px) saturate(1.04);
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
            box-shadow: -12px 0 34px rgba(72,40,34,0.18);
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
        className="fixed inset-0 z-[800] backdrop-blur-[2px]"
        onClick={close}
        style={{ animation: 'backdropFade 0.2s ease-out', background: 'rgba(91,56,45,0.28)' }}
      />
      <div className="drawer-wrap p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-extrabold truncate" style={{ color: '#5b382d' }}>{TITLE[kind]}</h2>
            <p className="text-xs leading-relaxed" style={{ color: '#886153' }}>
              {SUBTITLE[kind]}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-sm px-3 py-1.5 rounded-xl whitespace-nowrap"
            style={{
              background: 'linear-gradient(180deg, rgba(255,254,254,0.76), rgba(255,232,233,0.62))',
              color: '#cf405b',
              border: '1px solid rgba(229,116,132,0.32)',
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
