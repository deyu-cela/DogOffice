import { useEffect } from 'react';
import { useGameStore, TUTORIAL_DONE_STEP } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import {
  TUTORIAL_CONFIG,
  STEP_GACHA,
  STEP_CLOSE_GACHA,
  STEP_FATIGUE,
  STEP_WELCOME,
  STEP_CLOSE_TEAM,
} from './tutorialConfig';
import { TutorialSpotlight, TeacherCorner } from './TutorialSpotlight';
import { displayCompanyName } from '@/lib/companyName';
import { TutorialFatigueDiagram } from './TutorialFatigueDiagram';

export function Tutorial() {
  const step = useGameStore((s) => s.tutorialStep);
  const subStep = useGameStore((s) => s.tutorialSubStep);
  const advance = useGameStore((s) => s.advanceTutorial);
  const advanceSub = useGameStore((s) => s.advanceTutorialSubStep);
  const skip = useGameStore((s) => s.skipTutorial);
  const companyName = useGameStore((s) => s.companyName);
  const recruitOpen = useUiStore((s) => s.recruitModalOpen);
  const teamOpen = useUiStore((s) => s.teamModalOpen);
  const shopOpen = useUiStore((s) => s.shopModalOpen);
  const openRecruit = useUiStore((s) => s.openRecruitModal);
  const openTeam = useUiStore((s) => s.openTeamModal);

  // 進入抽卡 / 關閉抽卡步驟時自動打開抽卡視窗；玩家中途關掉或重整都會重開，直到完成 gate
  useEffect(() => {
    if ((step === STEP_GACHA || step === STEP_CLOSE_GACHA) && !recruitOpen) {
      openRecruit();
    }
  }, [step, recruitOpen, openRecruit]);

  // 關閉隊伍步驟：重整後若隊伍視窗沒開，自動補開讓玩家能按 X 完成 gate
  useEffect(() => {
    if (step === STEP_CLOSE_TEAM && !teamOpen) {
      openTeam();
    }
  }, [step, teamOpen, openTeam]);

  if (step <= 0 || step >= TUTORIAL_DONE_STEP) return null;
  const config = TUTORIAL_CONFIG.find((c) => c.step === step);
  if (!config) return null;

  // 抽卡步、關閉抽卡步、關閉隊伍步 anchor 在 modal 內，spotlight 不能藏；其他步驟有 modal 開就藏
  const interactingWithTarget =
    step === STEP_GACHA || step === STEP_CLOSE_GACHA || step === STEP_CLOSE_TEAM
      ? false
      : recruitOpen || teamOpen || shopOpen;

  const name = displayCompanyName(companyName);
  const fillName = (s: string) => s.replace(/\{COMPANY\}/g, name);
  const fillBubble = (b: { title: string; body: string; tip?: string }) => ({
    title: fillName(b.title),
    body: fillName(b.body),
    tip: b.tip ? fillName(b.tip) : undefined,
  });

  if (config.mode === 'spotlight-multi') {
    const slides = config.slides;
    const i = Math.min(subStep, slides.length - 1);
    const slide = slides[i];
    const isLast = i === slides.length - 1;
    return (
      <TutorialSpotlight
        anchor={slide.anchor}
        bubble={fillBubble(slide.bubble)}
        primaryLabel={isLast ? '下一步 →' : '下一個 →'}
        onPrimary={() => {
          if (isLast) advance();
          else advanceSub();
        }}
        progress={{ current: i + 1, total: slides.length }}
        onSkip={skip}
        hidden={interactingWithTarget}
      />
    );
  }

  if (config.mode === 'spotlight-gate') {
    const gateMsg =
      config.step === STEP_GACHA
        ? '請按下「招募 1 次」抽你的第一張卡'
        : config.step === STEP_CLOSE_GACHA
          ? '請按 X 關閉招募視窗'
          : config.step === STEP_CLOSE_TEAM
            ? '請按 X 關閉隊伍視窗'
            : '請點擊員工宿舍打開隊伍管理';
    // 關閉類步驟：anchor 緊貼按鈕，泡泡會擋到 X，只顯示遮罩+圈圈
    const bubbleless =
      config.step === STEP_CLOSE_TEAM || config.step === STEP_CLOSE_GACHA;
    return (
      <TutorialSpotlight
        anchor={config.anchor}
        bubble={fillBubble(config.bubble)}
        gateHint={gateMsg}
        onSkip={skip}
        hidden={interactingWithTarget}
        bubbleless={bubbleless}
      />
    );
  }

  // 'modal' 模式：welcome（step 1）與 fatigue（step 5）共用
  const isWelcome = config.step === STEP_WELCOME;
  const primaryLabel = isWelcome ? '開始教學 →' : '下一步 →';
  return (
    <div className="fixed inset-0 z-[880] flex items-center justify-center bg-black/25 p-4 pointer-events-auto">
      <div
        className="rounded-3xl p-5"
        style={{
          position: 'relative',
          width: 'min(460px, 100%)',
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid rgba(90,70,54,0.16)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
          animation: 'fadeInUp 0.25s ease',
          overflow: 'visible',
        }}
      >
        <TeacherCorner />
        <div
          className="text-xl font-extrabold mb-3 text-center"
          style={{ color: '#5a3e2a' }}
        >
          {fillBubble(config.bubble).title}
        </div>
        {config.diagram === 'fatigue-stats' && (
          <div className="mb-3">
            <TutorialFatigueDiagram />
          </div>
        )}
        <div
          className="text-sm leading-relaxed mb-4"
          style={{ color: 'var(--text)' }}
          dangerouslySetInnerHTML={{
            __html:
              fillBubble(config.bubble).body +
              (config.bubble.tip
                ? `<div style="margin-top:10px;padding:8px 12px;border-radius:12px;background:rgba(255,179,71,0.14);border:1px solid rgba(255,179,71,0.32);font-size:12.5px;color:#a66826">${fillName(config.bubble.tip)}</div>`
                : ''),
          }}
        />
        <div className="flex justify-between items-center">
          <button
            onClick={skip}
            className="text-xs"
            style={{
              background: 'transparent',
              color: 'var(--muted)',
              boxShadow: 'none',
              textDecoration: 'underline',
            }}
          >
            跳過教學
          </button>
          <button
            onClick={advance}
            className="px-7"
            style={{
              background: 'linear-gradient(180deg, #ffc7d1, #eb93a3)',
              color: 'white',
            }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
