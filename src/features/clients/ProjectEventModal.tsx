import { DogAvatar } from '@/components/DogAvatar';
import { SvgIcon } from '@/components/SvgIcon';
import { useGameStore } from '@/store/gameStore';
import type { ProjectEventKind } from '@/types';

type EventInfo = {
  title: string;
  desc: string;
  optionA: { label: string; outcome: string };
  optionB: { label: string; outcome: string };
};

const EVENT_INFO: Record<ProjectEventKind, EventInfo> = {
  changeRequest: {
    title: '客戶變更需求',
    desc: '客戶傳訊：「我們有一些新想法想加進來、有些舊的想拿掉...」',
    optionA: {
      label: '接受變更',
      outcome: '工作量 +25%、進度 ×0.85、reward +25%、隊員士氣 -2',
    },
    optionB: {
      label: '拒絕變更',
      outcome: 'reward -10%、信譽 -2、客戶 14 天冷卻、quality ×0.92',
    },
  },
  earlyDeliver: {
    title: '驗收提前',
    desc: '客戶：「我們急著上線，能不能這幾天就交？」',
    optionA: {
      label: '提前交件',
      outcome: 'deadline -2 天、reward +15%、隊員 fatigue +8、信譽 +1',
    },
    optionB: {
      label: '維持原期限',
      outcome: '信譽 -0.5，客戶有點失望',
    },
  },
  upsell: {
    title: '客戶加碼',
    desc: '客戶：「你們做得超棒，要不要把專案範圍擴大？」',
    optionA: {
      label: '升級成 tier+1',
      outcome: '工作量 +50%、reward 升級到 tier+1 區間、penalty 也升級',
    },
    optionB: {
      label: '維持原 tier',
      outcome: '不變，穩穩結算原 tier 報酬',
    },
  },
  bugBurst: {
    title: 'BUG 大爆發',
    desc: 'QA 衝進來：「線上爆 bug 了！」',
    optionA: {
      label: '全員加班修',
      outcome: '隊員 fatigue +20、loyalty -2、進度不影響',
    },
    optionB: {
      label: '認賠',
      outcome: 'quality ×0.85，永久打折直到結算、信譽 -1',
    },
  },
  dogLeaveAsk: {
    title: '員工想請假',
    desc: '員工冒泡：「老闆我有點累...」',
    optionA: {
      label: '准假回血',
      outcome: '當天該員 0 貢獻、fatigue -50、loyalty +5、士氣 +5、其他隊員 loyalty +1',
    },
    optionB: {
      label: '不准請假',
      outcome: 'fatigue +10、士氣 -8、loyalty -8，連 3 次直接離職',
    },
  },
  poaching: {
    title: '競爭對手挖角',
    desc: '對手公司打來：「我們想挖你們的頂尖員工。」',
    optionA: {
      label: '加薪留人',
      outcome: '永久薪水 +$15~20、loyalty +10~15',
    },
    optionB: {
      label: '不加薪',
      outcome: '依 loyalty 5~25% 跳槽率；跳槽後案件直接 failed，同事 loyalty -3',
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

  const targetDog = project.pendingEvent.targetDogId
    ? staff.find((d) => d.id === project.pendingEvent!.targetDogId)
    : null;

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-[#08204d]/55 backdrop-blur-sm p-4">
      <div
        className="p-5 rounded-xl max-w-sm w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#eef6ff', border: '1px solid var(--line)' }}>
            <SvgIcon name="warning" size={26} />
          </div>
          <div>
            <div className="text-base font-extrabold">{info.title}</div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
              接案事件
            </div>
          </div>
        </div>
        <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
          案件：<span className="font-extrabold" style={{ color: 'var(--text)' }}>{project.title}</span> ({project.clientName})
        </div>
        {targetDog && (
          <div className="text-xs mb-1 flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
            <DogAvatar role={targetDog.role} breed={targetDog.breed} size={19} />
            <span>員工：<b style={{ color: 'var(--text)' }}>{targetDog.name}</b>（{targetDog.role}・{targetDog.grade}）</span>
          </div>
        )}
        <div
          className="p-3 rounded-lg text-xs mb-3 leading-relaxed"
          style={{ background: '#f7fbff', border: '1px solid var(--line)', color: 'var(--text)' }}
        >
          {info.desc}
        </div>

        <div className="flex flex-col gap-2 mb-2">
          <button
            type="button"
            onClick={() => resolve(project.id, 'A')}
            className="p-3 rounded-lg text-left"
            style={{ background: 'linear-gradient(180deg, #eafff7, #d9f7ee)', border: '1px solid rgba(51,194,154,0.28)' }}
          >
            <div className="text-sm font-extrabold mb-0.5 flex items-center gap-1.5" style={{ color: '#16926f' }}>
              <SvgIcon name="quality" size={18} />
              <span>{info.optionA.label}</span>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{info.optionA.outcome}</div>
          </button>
          <button
            type="button"
            onClick={() => resolve(project.id, 'B')}
            className="p-3 rounded-lg text-left"
            style={{ background: 'linear-gradient(180deg, #fff7f7, #ffecec)', border: '1px solid rgba(255,112,112,0.24)' }}
          >
            <div className="text-sm font-extrabold mb-0.5 flex items-center gap-1.5" style={{ color: '#d34a4a' }}>
              <SvgIcon name="warning" size={18} />
              <span>{info.optionB.label}</span>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{info.optionB.outcome}</div>
          </button>
        </div>

        <button
          type="button"
          onClick={close}
          className="w-full h-9 rounded-lg text-xs font-bold"
          style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
        >
          稍後再決定
        </button>
      </div>
    </div>
  );
}
