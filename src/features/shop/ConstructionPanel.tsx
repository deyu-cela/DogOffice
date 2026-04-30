import { SvgIcon } from '@/components/SvgIcon';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { useGameStore } from '@/store/gameStore';

const OFFICE_TIER_BONUS = [0, 5, 12, 22, 35];
const OFFICE_TIER_CAP = [3, 3, 4, 4, 5];

function upgradeBenefits(curLv: number): string[] {
  const next = curLv + 1;
  const benefits: string[] = [];
  const curMax = OFFICE_LEVELS[curLv].maxStaff;
  const nextMax = OFFICE_LEVELS[next].maxStaff;
  if (nextMax > curMax) benefits.push(`員工上限 +${nextMax - curMax}（→${nextMax}）`);
  const curBonus = OFFICE_TIER_BONUS[curLv] ?? 0;
  const nextBonus = OFFICE_TIER_BONUS[next] ?? 0;
  if (nextBonus > curBonus) benefits.push(`稀有度 +${nextBonus - curBonus}`);
  const curCap = OFFICE_TIER_CAP[curLv] ?? 3;
  const nextCap = OFFICE_TIER_CAP[next] ?? 3;
  if (nextCap > curCap) benefits.push(`解鎖 tier${nextCap} 案件`);
  if (next === 3) benefits.push('達成 IPO 條件之一');
  return benefits;
}

export function ConstructionPanel() {
  const money = useGameStore((s) => s.money);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const upgrade = useGameStore((s) => s.upgradeOffice);

  const curLv = OFFICE_LEVELS[officeLevel];
  const nextLv = OFFICE_LEVELS[officeLevel + 1];
  const atMax = !nextLv;
  const benefits = atMax ? [] : upgradeBenefits(officeLevel);

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="p-3 rounded-xl"
        style={{ background: '#f7fbff', border: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#173b78' }}>
          <SvgIcon name="office" size={20} />
          <span>目前辦公室：{curLv.name}（Lv.{officeLevel + 1}）</span>
        </div>
        <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
          員工上限 {curLv.maxStaff}・稀有度加成 +{OFFICE_TIER_BONUS[officeLevel] ?? 0}・最高 tier{OFFICE_TIER_CAP[officeLevel] ?? 3} 案件
        </div>
      </div>

      {atMax ? (
        <div className="p-3 rounded-xl text-center" style={{ background: '#eefaf7', border: '1px solid rgba(51,194,154,0.28)' }}>
          <strong>已達最大規模</strong>
        </div>
      ) : (
        <div
          className="p-3 rounded-xl"
          style={{ background: 'linear-gradient(180deg, #ffffff, #eef6ff)', border: '1px solid #7fb2ef', boxShadow: 'var(--shadow-soft)' }}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <div className="font-bold flex items-center gap-1.5">
                <SvgIcon name="office" size={19} />
                <span>擴建 → {nextLv.name}</span>
              </div>
              <div className="flex flex-col gap-0.5 mt-1.5">
                {benefits.map((b, i) => (
                  <div key={i} className="text-[11px]" style={{ color: 'var(--muted)' }}>{b}</div>
                ))}
              </div>
            </div>
            <button
              disabled={money < nextLv.upgradeCost}
              onClick={upgrade}
              className="text-sm px-3"
              style={{
                background: money >= nextLv.upgradeCost ? 'linear-gradient(180deg, #2f8df4, #1c63c8)' : '#e9f1ff',
                color: money >= nextLv.upgradeCost ? 'white' : '#8aa2c8',
                border: '1px solid var(--line)',
              }}
            >
              ${nextLv.upgradeCost}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
