import { useEffect, useState } from 'react';
import { useSaveStore } from '@/store/saveStore';
import { HangingClipButton } from './HangingClipButton';

function formatRelative(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 10) return '剛剛儲存';
  if (diff < 60) return `${diff} 秒前儲存`;
  if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前儲存`;
  return `${Math.floor(diff / 3600)} 小時前儲存`;
}

const SAVE_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 3h12l4 4v14H3V5a2 2 0 0 1 2-2z" />
    <path d="M7 3v6h9V3" />
    <rect x="7" y="13" width="10" height="6" />
  </svg>
);

const WARNING_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3 22 21H2L12 3Z" />
    <path d="M12 10v5" />
    <path d="M12 18v.01" />
  </svg>
);

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

  let state: 'default' | 'warning' | 'busy' = 'default';
  let tooltip = '手動儲存到雲端';
  let disabled = false;

  if (status === 'saving') {
    state = 'busy';
    tooltip = '正在儲存';
    disabled = true;
  } else if (status === 'conflict') {
    state = 'warning';
    tooltip = '雲端存檔衝突，請選擇要保留的版本';
  } else if (status === 'error') {
    state = 'warning';
    tooltip = `儲存失敗${error ? `：${error}` : ''}`;
  } else if (lastSavedAt) {
    tooltip = `${formatRelative(lastSavedAt)}，點擊可再次儲存`;
  } else if (cloudRev) {
    tooltip = '已有雲端存檔，點擊可手動儲存';
  }

  return (
    <HangingClipButton
      bgColor="#d6efd0"
      iconColor="#3a7a4a"
      clipColor="#9ac890"
      tilt={-2}
      hangY={4}
      icon={state === 'warning' ? WARNING_ICON : SAVE_ICON}
      label={tooltip}
      state={state}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        saveToCloud();
      }}
    />
  );
}
