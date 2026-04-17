import { useGameStore } from '@/store/gameStore';

export function TrainingQuiz() {
  const ts = useGameStore((s) => s.trainingSession);
  const answer = useGameStore((s) => s.answerTraining);
  const next = useGameStore((s) => s.nextTrainingQuestion);
  const close = useGameStore((s) => s.closeTraining);

  if (!ts) return null;
  const { question, selected, correct, finished, totalReward, questionIndex, maxQuestions } = ts;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/40 p-4">
      <div className="rounded-3xl p-5 w-[520px] max-w-full" style={{ background: '#fffaf0', border: '2px solid rgba(90,70,54,0.12)' }}>
        {finished ? (
          <>
            <div className="text-2xl font-extrabold text-center mb-3">🎓 培訓完成！</div>
            <div className="text-center text-base mb-4">
              總得分：{totalReward}
              <br />
              產能加成：+{Math.round(totalReward * 0.8)}（每日衰減）
            </div>
            <button onClick={close} className="w-full" style={{ background: 'linear-gradient(180deg, #b6efab, #8ee28f)' }}>
              完成
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-between mb-3 text-xs" style={{ color: 'var(--muted)' }}>
              <span>
                題目 {questionIndex + 1} / {maxQuestions}
              </span>
              <span>累積 {totalReward} 分</span>
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
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={close} style={{ background: '#dcecff' }}>
                結束
              </button>
              <button disabled={selected === null} onClick={next} style={{ background: 'linear-gradient(180deg, #ffcf6b, #ff9f43)', color: 'white' }}>
                {questionIndex >= maxQuestions - 1 ? '完成培訓' : '下一題'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
