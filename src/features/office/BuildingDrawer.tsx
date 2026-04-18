import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { ShopPanel } from '@/features/shop/ShopPanel';
import { StaffList } from '@/features/staff/StaffList';
import { ResumeCard } from '@/features/recruit/ResumeCard';

const TITLE = {
  shop: '🛒 商店',
  dorm: '👥 員工宿舍',
  hr: '📋 人資辦公室',
} as const;

const SUBTITLE = {
  shop: '先擴建才能請更多狗。裝飾、設備、制度都會讓辦公室更像真的公司。',
  dorm: '管理狗狗員工、陪玩、培訓、調整職位。',
  hr: '面試新進員工，決定錄用或拒絕。',
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
          background: linear-gradient(180deg, #fffaf0, #fef0df);
          border: 2px solid rgba(90,70,54,0.15);
          box-shadow: 0 -10px 30px rgba(0,0,0,0.2);
        }
        @media (min-width: 768px) {
          .drawer-wrap {
            top: 0;
            right: 0;
            bottom: 0;
            width: min(100vw, 440px);
            border-top-left-radius: 28px;
            border-bottom-left-radius: 28px;
            animation: drawerSlideDesktop 0.25s ease-out;
            box-shadow: -10px 0 30px rgba(0,0,0,0.2);
          }
        }
        @media (max-width: 767px) {
          .drawer-wrap {
            left: 0;
            right: 0;
            bottom: 0;
            max-height: 85vh;
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            animation: drawerSlideMobile 0.25s ease-out;
          }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[800] bg-black/40"
        onClick={close}
        style={{ animation: 'backdropFade 0.2s ease-out' }}
      />
      <div className="drawer-wrap p-4 md:p-5">
        <div className="flex items-center justify-between mb-2 gap-3">
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-extrabold truncate">{TITLE[kind]}</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {SUBTITLE[kind]}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-sm px-3 py-1.5 rounded-full whitespace-nowrap"
            style={{ background: '#eeeae4', color: '#5b3c2b' }}
          >
            關閉 ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto mt-2">
          {kind === 'shop' && <ShopPanel />}
          {kind === 'dorm' && <StaffList />}
          {kind === 'hr' && <ResumeCard />}
        </div>
      </div>
    </>
  );
}
