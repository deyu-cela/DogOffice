import { useState } from 'react';
import { useGameStore, GACHA_COST } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { GachaModal } from './GachaModal';

export function GachaPanel() {
  const money = useGameStore((s) => s.money);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staffCount = useGameStore((s) => s.staff.length);
  const [open, setOpen] = useState(false);

  const maxStaff = OFFICE_LEVELS[officeLevel].maxStaff;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-xl p-4"
        style={{
          background: 'linear-gradient(180deg, #fff7e0, #ffe4a8)',
          border: '1.5px solid #e0c280',
        }}
      >
        <div className="text-xl font-extrabold" style={{ color: '#6a3d05' }}>嗷嗷嗷嗷</div>
        <div className="text-[11px] mt-0.5" style={{ color: '#8a5e1c' }}>
          基本抽卡台 ・ 單抽 ${GACHA_COST} ・ 連抽十發 ${GACHA_COST * 10}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl py-3 font-extrabold text-base"
        style={{
          background: 'linear-gradient(180deg, #ffd95a, #f0a818)',
          color: '#6a3d05',
          border: '1px solid rgba(176,107,15,0.45)',
          boxShadow: '0 8px 18px rgba(240,168,24,0.32)',
        }}
      >
        🎲 開啟抽卡台
      </button>

      <div className="text-[11px] text-center" style={{ color: 'var(--muted)' }}>
        資金 ${money.toLocaleString()}・員工 {staffCount} / {maxStaff}
      </div>

      <div
        className="rounded-lg p-3 text-[11px]"
        style={{ background: '#f7fbff', border: '1px solid var(--line)', color: 'var(--muted)' }}
      >
        <div className="font-bold mb-1" style={{ color: '#446da8' }}>規則</div>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>抽到新狗 → 加入員工 + 自動分配對應產業 team</li>
          <li>抽到圖鑑已有 → +1 碎片（升 Lv N→N+1 需 N 碎片）</li>
          <li>已 Lv.10 再抽到 → 所有碎片轉成錢</li>
          <li>隊伍管理 / 強化在「員工宿舍」面板</li>
        </ul>
      </div>

      {open && <GachaModal onClose={() => setOpen(false)} />}
    </div>
  );
}
