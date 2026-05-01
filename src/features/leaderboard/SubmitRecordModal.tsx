import { useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import { useGameStore } from '@/store/gameStore';

export function SubmitRecordModal() {
  const snap = useGameStore((s) => s.leaderboardSubmitModal);
  const submitOfficeRecord = useGameStore((s) => s.submitOfficeRecord);
  const closeLeaderboardSubmit = useGameStore((s) => s.closeLeaderboardSubmit);
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!snap) return null;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    await submitOfficeRecord(nickname.trim() || undefined);
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[860] flex items-center justify-center bg-[#08204d]/55 backdrop-blur-sm p-4">
      <div
        className="p-5 rounded-xl max-w-sm w-full"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,235,0.96))',
          border: '1px solid #f0c97a',
          boxShadow: '0 24px 70px rgba(210,140,30,0.28)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff7ec', border: '1px solid #f0c97a' }}>
            <SvgIcon name="trophy" size={27} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: '#9a6a1a' }}>恭喜入主豪華總部！</h2>
            <p className="text-xs" style={{ color: '#9a6a1a' }}>把這場成績留在排行榜吧</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="天數" value={snap.days} />
          <Stat label="現金" value={`$${snap.money.toLocaleString()}`} />
          <Stat label="員工" value={`${snap.staffCount} 位`} />
        </div>

        {!submitted ? (
          <>
            <label className="block text-[11px] font-bold mb-1" style={{ color: '#9a6a1a' }}>
              暱稱（最多 20 字，可留空）
            </label>
            <input
              type="text"
              value={nickname}
              maxLength={20}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="輸入你的署名"
              className="w-full px-3 py-2 rounded-lg text-sm mb-3"
              style={{ backgroundColor: '#ffffff', border: '1px solid #f0c97a' }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeLeaderboardSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
                style={{ backgroundColor: '#ffffff', color: '#9a6a1a', border: '1px solid #f0c97a' }}
              >
                先不上傳
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg font-extrabold text-sm text-white disabled:opacity-50"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #ff7a3d, #d24722)',
                  boxShadow: '0 6px 18px rgba(210,71,34,0.32)',
                }}
              >
                {submitting ? '上傳中…' : '上傳排行榜'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="text-center py-2 rounded-lg text-sm font-bold mb-3"
              style={{ backgroundColor: '#eef6ff', color: 'var(--blue)', border: '1px solid #7fb2ef' }}
            >
              成績已上傳！
            </div>
            <button
              type="button"
              onClick={closeLeaderboardSubmit}
              className="w-full py-2.5 rounded-lg font-extrabold text-sm text-white"
              style={{
                backgroundImage: 'linear-gradient(180deg, #5a8ed1, #3a6fb0)',
                boxShadow: '0 6px 18px rgba(58,111,176,0.32)',
              }}
            >
              關閉
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg px-2 py-1.5 text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #f0c97a' }}>
      <div className="text-[10px]" style={{ color: '#9a6a1a' }}>{label}</div>
      <div className="text-sm font-extrabold tabular-nums">{value}</div>
    </div>
  );
}
