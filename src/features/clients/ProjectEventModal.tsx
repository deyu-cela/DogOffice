import { useGameStore } from '@/store/gameStore';
import type { ProjectEventKind } from '@/types';

type EventInfo = {
  emoji: string;
  title: string;
  desc: string;
  optionA: { label: string; outcome: string };
  optionB: { label: string; outcome: string };
};

const EVENT_INFO: Record<ProjectEventKind, EventInfo> = {
  changeRequest: {
    emoji: '📝',
    title: '客戶變更需求',
    desc: '客戶傳訊：「我們有一些新想法想加進來、有些舊的想拿掉...」',
    optionA: {
      label: '✅ 接受變更',
      outcome: '工作量 +25%、進度 ×0.85（部分白做）、reward +25%、隊員士氣 -2',
    },
    optionB: {
      label: '❌ 拒絕變更',
      outcome: 'reward -10%、信譽 -2、客戶 14 天冷卻、quality ×0.92',
    },
  },
  earlyDeliver: {
    emoji: '🏃',
    title: '驗收提前',
    desc: '客戶：「我們急著上線，能不能這幾天就交？」',
    optionA: {
      label: '✅ 提前交件',
      outcome: 'deadline -2 天、reward +15%、隊員 fatigue +8、信譽 +1',
    },
    optionB: {
      label: '❌ 維持原期限',
      outcome: '信譽 -0.5（小幅，客戶有點失望）',
    },
  },
  upsell: {
    emoji: '🎁',
    title: '客戶加碼',
    desc: '客戶：「你們做得超棒，要不要把專案範圍擴大？」',
    optionA: {
      label: '✅ 升級成 tier+1',
      outcome: '工作量 +50%、reward 升級到 tier+1 區間、penalty 也升級',
    },
    optionB: {
      label: '❌ 維持原 tier',
      outcome: '不變，穩穩結算原 tier 報酬',
    },
  },
  bugBurst: {
    emoji: '🐛',
    title: 'BUG 大爆發',
    desc: 'QA 衝進來：「線上爆 bug 了！」',
    optionA: {
      label: '✅ 全員加班修',
      outcome: '隊員 fatigue +20、loyalty -2、進度不影響',
    },
    optionB: {
      label: '❌ 認賠',
      outcome: 'quality ×0.85（永久打折直到結算）、信譽 -1',
    },
  },
  dogLeaveAsk: {
    emoji: '😴',
    title: '員工想請假',
    desc: '員工冒泡：「老闆我有點累...」',
    optionA: {
      label: '✅ 准假回血',
      outcome: '當天該員 0 貢獻、fatigue -50、loyalty +5、士氣 +5、其他隊員 loyalty +1',
    },
    optionB: {
      label: '❌ 不准請假',
      outcome: 'fatigue +10、士氣 -8、loyalty -8（連 3 次直接離職！）',
    },
  },
  poaching: {
    emoji: '🤝',
    title: '競爭對手挖角',
    desc: '對手公司打來：「我們想挖你們的頂尖員工。」',
    optionA: {
      label: '✅ 加薪留人',
      outcome: '永久薪水 +$15~20、loyalty +10~15',
    },
    optionB: {
      label: '❌ 不加薪',
      outcome: '依 loyalty 5~25% 跳槽率；跳槽 → 案直接 failed + 同事 loyalty -3',
    },
  },
};

export function ProjectEventModal() {
  const modal = useGameStore((s) => s.projectEventModal);
  const clients = useGameStore((s) => s.clients);
  const staff = useGameStore((s) => s.staff);
  const resolve = useGameStore((s) => s.resolveProjectEvent);
  const close = useGameStore((s) => s.closeProjectEventModal);

  if (!modal) return null;
  const project = clients.find((c) => c.id === modal.projectId);
  if (!project || !project.pendingEvent) return null;
  const info = EVENT_INFO[project.pendingEvent.kind];

  // 找特定員工（請假/挖角）
  const targetDog = project.pendingEvent.targetDogId
    ? staff.find((d) => d.id === project.pendingEvent!.targetDogId)
    : null;

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="p-5 rounded-3xl max-w-sm w-full"
        style={{
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid #c0392b',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{info.emoji}</span>
          <span className="text-base font-extrabold">{info.title}</span>
        </div>
        <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
          案件：<span className="font-bold">{project.title}</span> ({project.clientName})
        </div>
        {targetDog && (
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
            員工：<span className="font-bold">{targetDog.emoji} {targetDog.name}</span>（{targetDog.role}・{targetDog.grade}）
          </div>
        )}
        <div
          className="p-2.5 rounded-xl text-xs mb-3"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(90,70,54,0.12)' }}
        >
          💬 {info.desc}
        </div>

        <div className="flex flex-col gap-2 mb-2">
          <button
            type="button"
            onClick={() => resolve(project.id, 'A')}
            className="p-3 rounded-xl text-left"
            style={{ background: 'linear-gradient(180deg, #e8f5e0, #d4ecca)', border: '1.5px solid #b8d8b0' }}
          >
            <div className="text-sm font-bold mb-0.5">{info.optionA.label}</div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{info.optionA.outcome}</div>
          </button>
          <button
            type="button"
            onClick={() => resolve(project.id, 'B')}
            className="p-3 rounded-xl text-left"
            style={{ background: 'linear-gradient(180deg, #fcf0e8, #f8e0d0)', border: '1.5px solid #e8c8b0' }}
          >
            <div className="text-sm font-bold mb-0.5">{info.optionB.label}</div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{info.optionB.outcome}</div>
          </button>
        </div>

        <button
          type="button"
          onClick={close}
          className="w-full py-1.5 rounded-full text-xs"
          style={{ background: '#eeeae4', color: 'var(--muted)' }}
        >
          稍後再決定
        </button>
      </div>
    </div>
  );
}
