import { useGameStore, TUTORIAL_DONE_STEP } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { HINT_CONTENT, HINT_ANCHORS, HINT_PRIMARY_LABEL } from './tutorialConfig';
import { TeacherCorner, TutorialSpotlight } from './TutorialSpotlight';

// 觸發式提示：
// - 有 anchor 的（成就/排行榜/擴建）→ 用 spotlight 樣式（暗化遮罩 + 圈圈指該位置）
// - 沒 anchor 的（玩具）→ 置中浮卡
export function HintBubble() {
  const activeHint = useGameStore((s) => s.activeHint);
  const dismiss = useGameStore((s) => s.dismissHint);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const teamOpen = useUiStore((s) => s.teamModalOpen);
  const recruitOpen = useUiStore((s) => s.recruitModalOpen);
  const shopOpen = useUiStore((s) => s.shopModalOpen);
  const projectDetailId = useUiStore((s) => s.projectDetailId);
  const starterPackOpen = useUiStore((s) => s.showStarterPack);

  if (!activeHint) return null;
  // 開局教學進行中時不疊上去（避免兩層教學）
  if (tutorialStep > 0 && tutorialStep < TUTORIAL_DONE_STEP) return null;
  // 主要 modal（隊伍/抽卡/商店/案件詳情/新手禮包）開啟中先暫停 hint，等玩家關掉再顯示
  if (teamOpen || recruitOpen || shopOpen || projectDetailId || starterPackOpen) return null;

  const content = HINT_CONTENT[activeHint];
  const anchor = HINT_ANCHORS[activeHint] ?? null;
  const primaryLabel = HINT_PRIMARY_LABEL[activeHint] ?? '下一步';

  if (anchor) {
    return (
      <TutorialSpotlight
        anchor={anchor}
        bubble={content}
        primaryLabel={primaryLabel}
        onPrimary={dismiss}
        showSkip={false}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[885] flex items-center justify-center bg-black/25 p-4 pointer-events-auto"
      style={{ animation: 'fadeIn 0.25s ease' }}
    >
      <div
        className="rounded-2xl p-4"
        style={{
          width: 'min(360px, calc(100vw - 32px))',
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid rgba(255,179,71,0.4)',
          boxShadow: '0 14px 36px rgba(0,0,0,0.22)',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <TeacherCorner />
        <button
          onClick={dismiss}
          aria-label="關閉"
          style={{
            position: 'absolute',
            top: 6,
            right: 8,
            background: 'transparent',
            color: 'var(--muted)',
            boxShadow: 'none',
            fontSize: 16,
            padding: 4,
            lineHeight: 1,
          }}
        >
          ×
        </button>
        <div
          className="text-base font-extrabold mb-2"
          style={{ color: '#a66826' }}
        >
          {content.title}
        </div>
        <div
          className="text-sm leading-relaxed mb-3"
          style={{ color: 'var(--text)' }}
          dangerouslySetInnerHTML={{
            __html:
              content.body +
              (content.tip
                ? `<div style="margin-top:8px;padding:6px 10px;border-radius:10px;background:rgba(255,179,71,0.14);border:1px solid rgba(255,179,71,0.3);font-size:12px;color:#a66826">${content.tip}</div>`
                : ''),
          }}
        />
        <div className="text-right">
          <button
            onClick={dismiss}
            className="text-sm px-4"
            style={{
              background: 'linear-gradient(180deg, #ffc7d1, #eb93a3)',
              color: 'white',
            }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }`}</style>
    </div>
  );
}
