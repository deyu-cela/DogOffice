import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';

export function ResumeCard() {
  const current = useGameStore((s) => s.current);
  const staff = useGameStore((s) => s.staff);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const vacancy = useGameStore((s) => s.vacancy);
  const vacancyTimer = useGameStore((s) => s.vacancyTimer);
  const hire = useGameStore((s) => s.hireCandidate);
  const reject = useGameStore((s) => s.rejectCandidate);
  const playMini = useGameStore((s) => s.openPlayMiniGame);
  const openTraining = useGameStore((s) => s.openTraining);

  const maxStaff = OFFICE_LEVELS[officeLevel].maxStaff;
  const atCapacity = staff.length >= maxStaff;

  if (!current) {
    if (vacancy) {
      return (
        <div
          className="mt-3 p-5 rounded-2xl text-center"
          style={{ background: '#fffaf0', border: '2px dashed rgba(90,70,54,0.18)', color: 'var(--muted)' }}
        >
          <div className="text-5xl mb-2" style={{ animation: 'bob 2s ease-in-out infinite' }}>
            😴
          </div>
          <div className="font-bold mb-1" style={{ color: 'var(--text)' }}>
            人才荒期
          </div>
          <div className="text-xs leading-relaxed">
            目前沒有候選狗狗，趁這段時間培訓或買道具吧！
            <br />
            （還要等 {vacancyTimer} 天）
          </div>
        </div>
      );
    }
    return (
      <div className="mt-3 p-4 rounded-2xl text-center" style={{ background: '#fffaf0', border: '2px dashed rgba(90,70,54,0.18)', color: 'var(--muted)' }}>
        等候下一位候選狗狗...
      </div>
    );
  }

  return (
    <div
      className="mt-3 p-4 rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
        border: '2px dashed rgba(90,70,54,0.18)',
      }}
    >
      <div className="grid gap-3.5" style={{ gridTemplateColumns: '120px 1fr' }}>
        <div
          className="rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            width: 120,
            height: 150,
            background: 'linear-gradient(180deg, #fff7ef, #f4e0c8)',
            border: '2px solid rgba(90,70,54,0.12)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7)',
          }}
        >
          {current.image ? (
            <img src={current.image} alt={current.role} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">{current.emoji}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-lg">{current.name}</span>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: '#ffb347', color: 'white' }}
            >
              {current.grade}
            </span>
            {current.isCEO && <span className="text-sm">👑 CEO</span>}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {current.breed}・{current.role}
          </div>
          <div className="flex gap-1.5 flex-wrap mt-2">
            {current.traits.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-1 rounded-full"
                style={{ background: 'white', border: '1px solid rgba(90,70,54,0.12)' }}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            💰 期望日薪 ${current.expectedSalary}
          </div>
        </div>
      </div>

      <div className="mt-2 p-2.5 rounded-xl text-xs leading-relaxed" style={{ background: 'rgba(255,255,255,.7)', border: '1px solid rgba(90,70,54,0.1)', color: 'var(--muted)' }}>
        💬 {current.motto}
      </div>

      <ul className="mt-2 pl-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        <li>💼 {current.passive}</li>
        <li>⭐ {current.flavor}</li>
      </ul>

      {current.interview && (
        <div className="mt-2 p-2 rounded-xl text-xs" style={{ background: '#fff5e8', border: '1px solid rgba(255,179,71,0.3)' }}>
          <div className="font-bold mb-1">面試 Q：{current.interview.q}</div>
          <div style={{ color: 'var(--muted)' }}>
            ✅ {current.interview.goodAnswer}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 mt-3.5">
        <button
          disabled={atCapacity}
          onClick={hire}
          style={{ background: 'linear-gradient(180deg, #b6efab, #8ee28f)' }}
        >
          錄用 ${current.expectedSalary * 2}
        </button>
        <button onClick={reject} style={{ background: 'linear-gradient(180deg, #ffdba5, #ffbf73)' }}>
          婉拒
        </button>
      </div>

      {atCapacity && (
        <div className="text-center text-xs font-bold mt-2" style={{ color: '#ef5350' }}>
          辦公室已滿，請先升級或資遣員工
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 mt-2.5">
        <button
          disabled={staff.length < 3}
          onClick={playMini}
          style={{ background: 'linear-gradient(180deg, #dcecff, #c6deff)', fontSize: 13 }}
        >
          🎮 陪玩
        </button>
        <button
          disabled={staff.length < 2}
          onClick={openTraining}
          style={{ background: 'linear-gradient(180deg, #dcecff, #c6deff)', fontSize: 13 }}
        >
          📚 培訓
        </button>
      </div>
    </div>
  );
}
