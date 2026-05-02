import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

const STAT_OPTIONS: { id: 'speed' | 'quality' | 'patience'; label: string; color: string }[] = [
  { id: 'speed', label: '⚡ 速度', color: '#3a7a3f' },
  { id: 'quality', label: '✨ 專業', color: '#2b7abd' },
  { id: 'patience', label: ' 耐心', color: '#7b3a9f' },
];

export function TrainingQuiz() {
  const ts = useGameStore((s) => s.trainingSession);
  const staff = useGameStore((s) => s.staff);
  const answer = useGameStore((s) => s.answerTraining);
  const next = useGameStore((s) => s.nextTrainingQuestion);
  const close = useGameStore((s) => s.closeTraining);
  const apply = useGameStore((s) => s.applyTrainingBoost);

  const [pickedDog, setPickedDog] = useState<string | null>(null);

  if (!ts) return null;
  const { question, selected, correct, finished, totalReward, correctCount, questionIndex, maxQuestions } = ts;

  const eligible = correctCount >= 4;

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-black/40 p-4">
      <div className="rounded-3xl p-5 w-[520px] max-w-full" style={{ background: '#fffaf0', border: '2px solid rgba(90,70,54,0.12)' }}>
        {finished ? (
          <>
            <div className="text-2xl font-extrabold text-center mb-2"> 培訓完成！</div>
            <div className="text-center text-sm mb-3" style={{ color: 'var(--muted)' }}>
              答對 {correctCount} / {maxQuestions} 題 · 累積 {totalReward} 分
            </div>

            {!eligible ? (
              <>
                <div
                  className="p-3 rounded-2xl text-sm text-center mb-3"
                  style={{ background: '#fff0f0', color: '#c0392b', border: '1px solid #e8c8c8' }}
                >
                  答對未滿 4 題，這次無法 +1 stat。
                </div>
                <button onClick={close} className="w-full" style={{ background: 'linear-gradient(180deg, #b6efab, #8ee28f)' }}>
                  關閉
                </button>
              </>
            ) : !pickedDog ? (
              <>
                <div className="text-sm font-bold mb-2 text-center">挑一位員工 → 為他加 1 點能力</div>
                <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto mb-3">
                  {staff.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setPickedDog(d.id)}
                      className="text-[12px] px-2 py-2 rounded-lg flex items-center gap-1"
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        border: '1px solid rgba(90,70,54,0.12)',
                      }}
                    >
                      <span>{d.emoji}</span>
                      <span className="font-bold">{d.name}</span>
                      <span style={{ color: 'var(--muted)' }}>{d.role}</span>
                    </button>
                  ))}
                </div>
                <button onClick={close} className="w-full" style={{ background: '#dcecff' }}>
                  跳過（不加 stat）
                </button>
              </>
            ) : (
              <>
                <div className="text-sm font-bold mb-2 text-center">
                  為 <b>{staff.find((d) => d.id === pickedDog)?.name}</b> 加哪一項能力？
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {STAT_OPTIONS.map((s) => {
                    const dog = staff.find((d) => d.id === pickedDog);
                    const cur = dog?.stats[s.id] ?? 0;
                    const isMax = cur >= 10;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={isMax}
                        onClick={() => apply(pickedDog, s.id)}
                        className="py-2 rounded-lg font-bold"
                        style={{
                          background: isMax ? '#eee' : 'rgba(255,255,255,0.85)',
                          color: isMax ? '#999' : s.color,
                          border: `1.5px solid ${isMax ? '#ccc' : s.color}`,
                          cursor: isMax ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {s.label} {cur} {isMax ? '(已滿)' : `→ ${cur + 1}`}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setPickedDog(null)}
                  className="w-full py-1.5 text-xs rounded-full"
                  style={{ background: '#eeeae4', color: '#5b3c2b' }}
                >
                  ← 換一位員工
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between mb-3 text-xs" style={{ color: 'var(--muted)' }}>
              <span>
                題目 {questionIndex + 1} / {maxQuestions}
              </span>
              <span>累積 {totalReward} 分 · 答對 {correctCount}</span>
            </div>
            <div className="font-extrabold text-lg mb-4">{question.q}</div>
            <div className="flex flex-col gap-2.5 mb-3">
              {question.options.map((opt, i) => {
                const picked = selected === i;
                const showResult = selected !== null;
                const isCorrect = i === question.answer;
                let bg = 'rgba(255,255,255,0.9)';
                if (showResult && isCorrect) bg = 'linear-gradient(180deg, #b6efab, #8ee28f)';
                else if (showResult && picked && !isCorrect) bg = 'linear-gradient(180deg, #ffb3b3, #ef8f52)';
                return (
                  <button
                    key={i}
                    disabled={selected !== null}
                    onClick={() => answer(i)}
                    className="text-left"
                    style={{ background: bg }}
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="text-center text-sm mb-3" style={{ color: correct ? '#388e3c' : '#c62828' }}>
                {correct ? `✅ 答對！+${question.reward}` : '❌ 答錯了'}
              </div>
            )}
            <div className="text-[11px] text-center mb-2" style={{ color: 'var(--muted)' }}>
              答對 ≥ 4 題 → 可選 1 員工 +1 stat
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={close} style={{ background: '#dcecff' }}>
                結束
              </button>
              <button disabled={selected === null} onClick={next} style={{ background: 'linear-gradient(180deg, #ffc7d1, #eb93a3)', color: 'white' }}>
                {questionIndex >= maxQuestions - 1 ? '完成培訓' : '下一題'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
