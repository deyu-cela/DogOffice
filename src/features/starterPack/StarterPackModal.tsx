import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { CEO_DOG, ROLE_IMAGE_MAP } from '@/constants/dogRoles';

export function StarterPackModal() {
  const show = useUiStore((s) => s.showStarterPack);
  const close = useUiStore((s) => s.closeStarterPack);
  const claimed = useGameStore((s) => s.claimedStarterPack);
  const claim = useGameStore((s) => s.claimStarterPack);

  if (!show || claimed) return null;

  function onYes() {
    claim();
    close();
  }

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#08204d]/55 backdrop-blur-sm p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="text-center rounded-2xl p-7 max-w-md w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid rgba(207,225,249,0.9)',
          boxShadow: '0 28px 70px rgba(30,90,180,0.32)',
        }}
      >
        <div
          className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: 'linear-gradient(180deg, #fff7e0, #ffe9b8)',
            border: '1px solid rgba(255,212,148,0.9)',
            boxShadow: '0 12px 24px rgba(204,138,42,0.18)',
          }}
        >
          🎁
        </div>
        <div className="text-2xl font-extrabold mb-2" style={{ color: '#173b78' }}>
          GameJam 投票送禮
        </div>
        <div className="text-base mb-5" style={{ color: '#5979a6' }}>
          你願意去 GameJam 投票給我嗎？
          <br />
          有票就送你一隻專屬 CEO 狗狗 🐶
        </div>

        <div
          className="rounded-xl p-4 mb-5 flex items-center gap-4 text-left"
          style={{
            background: 'rgba(246,251,255,0.92)',
            border: '1px solid rgba(207,225,249,0.92)',
          }}
        >
          <img
            src={ROLE_IMAGE_MAP[CEO_DOG.role]}
            alt="刀霸翎"
            className="w-16 h-16 rounded-lg object-cover"
            draggable={false}
          />
          <div className="flex-1 min-w-0">
            <div className="text-lg font-extrabold" style={{ color: '#173b78' }}>
              刀霸翎
            </div>
            <div className="text-xs font-bold mb-1" style={{ color: '#5a8ce6' }}>
              CEO · S 級 · 月薪 $0
            </div>
            <div className="text-xs leading-5" style={{ color: '#7c95bc' }}>
              「Never be afraid, keep on moving!」
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={close}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-extrabold"
            style={{
              background: 'rgba(255,255,255,0.96)',
              border: '1px solid rgba(210,226,248,0.9)',
              color: '#6f83a5',
            }}
          >
            先不要
          </button>
          <button
            type="button"
            onClick={onYes}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-extrabold text-white"
            style={{
              background: 'linear-gradient(180deg, #57a8ff, #257ee8)',
              border: '1px solid rgba(255,255,255,0.86)',
              boxShadow: '0 14px 28px rgba(37,126,232,0.32)',
            }}
          >
            投了！領禮包
          </button>
        </div>
      </div>
    </div>
  );
}
