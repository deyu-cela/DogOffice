import { SvgIcon } from '@/components/SvgIcon';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { useGameStore } from '@/store/gameStore';

export function VictoryModal() {
  const ipoAchievedAt = useGameStore((s) => s.ipoAchievedAt);
  const ipoDismissed = useGameStore((s) => s.ipoDismissed);
  const money = useGameStore((s) => s.money);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const staff = useGameStore((s) => s.staff);
  const dismissIpo = useGameStore((s) => s.dismissIpo);
  const restart = useGameStore((s) => s.restart);

  if (ipoAchievedAt === null || ipoDismissed) return null;

  const levelName = OFFICE_LEVELS[officeLevel]?.name ?? `Lv${officeLevel + 1}`;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-[#08204d]/50 backdrop-blur-sm p-4">
      <div
        className="p-7 rounded-xl max-w-md w-full text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
      >
        <div className="mx-auto mb-3 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#eef6ff', border: '1px solid var(--line)' }}>
          <SvgIcon name="trophy" size={38} />
        </div>
        <div className="text-2xl font-extrabold mb-2" style={{ color: 'var(--blue)' }}>公司 IPO 上市了！</div>
        <div className="text-sm mb-5" style={{ color: 'var(--muted)' }}>狗狗們敲響了上市鐘，全公司沸騰！</div>

        <div className="grid grid-cols-2 gap-3 mb-5 p-4 rounded-lg" style={{ background: '#f7fbff', border: '1px solid var(--line)' }}>
          <VictoryStat label="達成天數" value={`${ipoAchievedAt} 天`} large />
          <VictoryStat label="最終資金" value={`$${money.toLocaleString()}`} green large />
          <VictoryStat label="完成案件" value={`${projectsCompleted} 件`} />
          <VictoryStat label="辦公室" value={levelName} />
          <VictoryStat label="員工數" value={`${staff.length} 位`} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={dismissIpo} className="py-2.5 rounded-lg font-extrabold text-sm" style={{ background: 'linear-gradient(180deg, #35c59c, #16a77f)', color: 'white' }}>
            繼續經營
          </button>
          <button type="button" onClick={restart} className="py-2.5 rounded-lg font-extrabold text-sm" style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}>
            再開一局
          </button>
        </div>
      </div>
    </div>
  );
}

function VictoryStat({ label, value, large = false, green = false }: { label: string; value: string; large?: boolean; green?: boolean }) {
  return (
    <div>
      <div className="text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className={large ? 'text-2xl font-extrabold' : 'text-base font-bold'} style={{ color: green ? '#16926f' : 'var(--text)' }}>{value}</div>
    </div>
  );
}
