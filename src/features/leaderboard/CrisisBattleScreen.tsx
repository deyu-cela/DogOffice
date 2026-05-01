import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ROLE_IMAGE_MAP } from '@/constants/dogRoles';
import { SvgIcon } from '@/components/SvgIcon';
import type { CrisisGameState, LeaderboardEntry } from '@/types';

export function CrisisBattleScreen() {
  const mg = useGameStore((s) => s.miniGame);
  if (!mg || mg.type !== 'crisis') return null;
  return mg.ended ? <ResultPhase mg={mg} /> : <BattlePhase mg={mg} />;
}

function BattlePhase({ mg }: { mg: CrisisGameState }) {
  const ceoPct = mg.ceoMaxHp > 0 ? Math.max(0, mg.ceoHp / mg.ceoMaxHp) : 0;

  return (
    <div className="fixed inset-0 z-[850] flex flex-col bg-gradient-to-b from-[#0a1430] via-[#1a2552] to-[#360e1c] overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="text-white">
          <div className="text-[11px] tracking-widest opacity-70">FINANCIAL TSUNAMI</div>
          <div className="text-xl font-extrabold">金融海嘯 BOSS 戰</div>
        </div>
        <div className="text-right text-white">
          <div className="text-[11px] opacity-70">已造成傷害</div>
          <div className="text-2xl font-extrabold tabular-nums">{Math.floor(mg.totalDamage)}</div>
        </div>
      </header>

      {/* Monster top */}
      <section className="flex-1 flex flex-col items-center justify-center relative">
        <MonsterArt totalDamage={mg.totalDamage} />
        <div className="mt-4 text-white text-center">
          <div className="text-[11px] tracking-widest opacity-60">HP</div>
          <div className="text-2xl font-extrabold">∞</div>
        </div>
        <FloatingDamageLayer fx={mg.hitFx.filter((f) => f.side === 'monster')} color="#ffd44a" />
      </section>

      <div className="h-px bg-white/10 mx-12" />

      {/* CEO bottom */}
      <section className="flex-1 flex flex-col items-center justify-center relative pb-6">
        <FloatingDamageLayer fx={mg.hitFx.filter((f) => f.side === 'ceo')} color="#ff6b6b" />
        <div className="relative">
          <img
            src={ROLE_IMAGE_MAP['CEO']}
            alt="CEO"
            className="w-40 h-40 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          />
        </div>
        <div className="mt-3 w-72">
          <div className="flex justify-between text-white text-[11px] mb-1">
            <span className="opacity-70">CEO HP</span>
            <span className="tabular-nums font-bold">
              {Math.ceil(mg.ceoHp)} / {mg.ceoMaxHp}
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${ceoPct * 100}%`,
                backgroundImage: 'linear-gradient(90deg, #ffe066, #ff8a3d)',
              }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-white text-center text-[11px]">
          <Stat label="專業 (ATK)" value={mg.ceoAtk} />
          <Stat label="速度 (間隔)" value={`${mg.ceoInterval.toFixed(2)}s`} />
          <Stat label="隊伍規模" value={`${mg.teamSize} 隻`} />
        </div>
      </section>
    </div>
  );
}

function ResultPhase({ mg }: { mg: CrisisGameState }) {
  const finishCrisis = useGameStore((s) => s.finishCrisis);
  const closeCrisis = useGameStore((s) => s.closeCrisis);
  const openCrisisBattle = useGameStore((s) => s.openCrisisBattle);
  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState<LeaderboardEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const entry = await finishCrisis(nickname.trim() || undefined);
    setSubmitting(false);
    if (entry) setSubmitted(entry);
  };

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-[#08204d]/70 backdrop-blur-sm p-4">
      <div
        className="rounded-xl p-6 max-w-md w-full"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
      >
        <div className="text-center mb-4">
          <div className="mx-auto mb-2 w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff7f7', border: '1px solid rgba(255,112,112,0.24)' }}>
            <SvgIcon name="trophy" size={36} />
          </div>
          <div className="text-2xl font-extrabold mb-1">CEO 倒下了！</div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            隊伍 {mg.teamSize} 隻狗・對金融海嘯造成
          </div>
          <div className="text-4xl font-black mt-2 tabular-nums" style={{ color: 'var(--blue)' }}>
            {Math.floor(mg.totalDamage)}
            <span className="text-base font-bold ml-1" style={{ color: 'var(--muted)' }}>傷害</span>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-3 mb-3 rounded-lg" style={{ backgroundColor: '#eef6ff', border: '1px solid #7fb2ef' }}>
            <div className="text-sm font-bold" style={{ color: 'var(--blue)' }}>已上傳排行榜</div>
            {submitted.nickname && (
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>玩家：@{submitted.nickname}</div>
            )}
          </div>
        ) : (
          <div className="mb-3">
            <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--muted)' }}>
              署名（可空白）
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              placeholder="留下你的名字"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: '#ffffff', border: '1px solid var(--line)' }}
            />
          </div>
        )}

        <div className="flex gap-2">
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
              style={{ backgroundImage: 'linear-gradient(180deg, #2f8df4, #1c63c8)', color: 'white' }}
            >
              {submitting ? '上傳中...' : '提交分數'}
            </button>
          )}
          <button
            onClick={() => {
              closeCrisis();
              openCrisisBattle();
            }}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            再戰一次
          </button>
          <button
            onClick={closeCrisis}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: '#ffffff', color: 'var(--muted)', border: '1px solid var(--line)' }}
          >
            離開
          </button>
        </div>
      </div>
    </div>
  );
}

function MonsterArt({ totalDamage }: { totalDamage: number }) {
  const wobble = (Math.sin(totalDamage / 25) + 1) * 4;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 200, height: 200 }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: 'radial-gradient(circle, #4d1f3f 0%, #1a0a18 70%)',
          filter: 'blur(2px)',
          transform: `translateY(${wobble}px)`,
        }}
      />
      <div
        className="relative text-7xl select-none"
        style={{ transform: `translateY(${-wobble}px)` }}
        aria-label="金融海嘯"
      >
        🌊
      </div>
      <div className="absolute -bottom-2 text-white text-xs font-extrabold tracking-widest opacity-80">
        金融海嘯
      </div>
    </div>
  );
}

function FloatingDamageLayer({ fx, color }: { fx: { id: number; damage: number; bornAt: number }[]; color: string }) {
  const now = performance.now();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {fx.map((f) => {
        const age = (now - f.bornAt) / 700;
        const y = age * 60;
        const opacity = Math.max(0, 1 - age);
        return (
          <div
            key={f.id}
            className="absolute left-1/2 top-1/2 text-2xl font-black tabular-nums"
            style={{
              transform: `translate(-50%, calc(-50% - ${y}px))`,
              color,
              opacity,
              textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            -{f.damage}
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg px-2 py-1.5 bg-white/5 border border-white/10">
      <div className="opacity-60">{label}</div>
      <div className="font-extrabold tabular-nums text-sm">{value}</div>
    </div>
  );
}
