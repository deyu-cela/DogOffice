import { useEffect, useRef, useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import { useGameStore } from '@/store/gameStore';
import { displayCompanyName } from '@/lib/companyName';

export function SubmitRecordModal() {
  const snap = useGameStore((s) => s.leaderboardSubmitModal);
  const submitOfficeRecord = useGameStore((s) => s.submitOfficeRecord);
  const closeLeaderboardSubmit = useGameStore((s) => s.closeLeaderboardSubmit);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!snap || submittedRef.current) return;
    submittedRef.current = true;
    void submitOfficeRecord().then(() => setSubmitted(true));
  }, [snap, submitOfficeRecord]);

  if (!snap) return null;

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
            <p className="text-xs" style={{ color: '#9a6a1a' }}>成績已自動登上排行榜</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="天數" value={snap.days} />
          <Stat label="現金" value={`$${snap.money.toLocaleString()}`} />
          <Stat label="員工" value={`${snap.staffCount} 位`} />
        </div>

        <div
          className="px-3 py-2 rounded-lg text-sm mb-3 text-center"
          style={{ backgroundColor: '#fff7ec', border: '1px solid #f0c97a', color: '#9a6a1a' }}
        >
          <div className="text-[11px] font-bold mb-0.5">已上榜名字</div>
          <div className="text-base font-extrabold truncate" title={displayCompanyName(snap.companyName)}>
            {displayCompanyName(snap.companyName)}
          </div>
        </div>
        <div
          className="text-center py-2 rounded-lg text-sm font-bold mb-3"
          style={{ backgroundColor: '#eef6ff', color: 'var(--blue)', border: '1px solid #7fb2ef' }}
        >
          {submitted ? '成績已上傳！' : '上傳中…'}
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
