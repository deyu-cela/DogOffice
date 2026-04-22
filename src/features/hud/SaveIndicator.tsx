import { useEffect, useState } from 'react';
import { useSaveStore } from '@/store/saveStore';

function formatRelative(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 10) return '剛才已存';
  if (diff < 60) return `${diff} 秒前已存`;
  if (diff < 3600) return `${Math.floor(diff / 60)} 分前已存`;
  return `${Math.floor(diff / 3600)} 小時前已存`;
}

export function SaveIndicator() {
  const status = useSaveStore((s) => s.status);
  const lastSavedAt = useSaveStore((s) => s.lastSavedAt);
  const cloudRev = useSaveStore((s) => s.cloud?.revision);
  const error = useSaveStore((s) => s.error);
  const saveToCloud = useSaveStore((s) => s.saveToCloud);

  const [, bumpTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => bumpTick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  let icon = '💾';
  let tooltip = '尚未存檔 · 點一下立即存檔';
  let disabled = false;

  if (status === 'saving') {
    icon = '⏳';
    tooltip = '存檔中…';
    disabled = true;
  } else if (status === 'conflict') {
    icon = '⚠️';
    tooltip = '存檔有衝突，請到衝突視窗處理';
  } else if (status === 'error') {
    icon = '⚠️';
    tooltip = `存檔失敗${error ? `：${error}` : ''} · 點一下重試`;
  } else if (lastSavedAt) {
    tooltip = `${formatRelative(lastSavedAt)} · 點一下立即存檔`;
  } else if (cloudRev) {
    tooltip = '已同步 · 點一下立即存檔';
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        saveToCloud();
      }}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      className="px-2.5 py-1.5 rounded-full text-xs whitespace-nowrap leading-none"
      style={{
        background: 'linear-gradient(180deg, #fff0f3, #fbd5db)',
        border: '1px solid rgba(90,70,54,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
        cursor: disabled ? 'wait' : 'pointer',
      }}
    >
      {icon}
    </button>
  );
}
