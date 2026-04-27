import { useEffect, useState } from 'react';
import { useSaveStore } from '@/store/saveStore';

function formatRelative(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 10) return '剛剛儲存';
  if (diff < 60) return `${diff} 秒前儲存`;
  if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前儲存`;
  return `${Math.floor(diff / 3600)} 小時前儲存`;
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

  let label: 'save' | 'busy' | 'warning' = 'save';
  let tooltip = '手動儲存到雲端';
  let disabled = false;

  if (status === 'saving') {
    label = 'busy';
    tooltip = '正在儲存';
    disabled = true;
  } else if (status === 'conflict') {
    label = 'warning';
    tooltip = '雲端存檔衝突，請選擇要保留的版本';
  } else if (status === 'error') {
    label = 'warning';
    tooltip = `儲存失敗${error ? `：${error}` : ''}`;
  } else if (lastSavedAt) {
    tooltip = `${formatRelative(lastSavedAt)}，點擊可再次儲存`;
  } else if (cloudRev) {
    tooltip = '已有雲端存檔，點擊可手動儲存';
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
      className="grid h-12 w-12 place-items-center rounded-xl"
      style={{
        background: 'linear-gradient(180deg, #ffffff, #f4f9ff)',
        border: '1px solid rgba(121, 164, 224, 0.34)',
        boxShadow: '0 4px 12px rgba(46,104,180,0.1), inset 0 1px 0 rgba(255,255,255,0.95)',
        color: 'var(--text)',
        cursor: disabled ? 'wait' : 'pointer',
      }}
    >
      {label === 'save' && <SaveIcon />}
      {label === 'busy' && <span className="text-lg">...</span>}
      {label === 'warning' && <span className="text-lg">!</span>}
    </button>
  );
}

function SaveIcon() {
  return (
    <svg width="27" height="27" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="save-icon-blue" x1="0" x2="0" y1="4" y2="28">
          <stop stopColor="#4f95ef" />
          <stop offset="1" stopColor="#1d5fb8" />
        </linearGradient>
      </defs>
      <path
        d="M7 5h15l3 3v19H7V5Z"
        fill="url(#save-icon-blue)"
        stroke="#17356f"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11 5h9v8h-9V5Z" fill="#f7fbff" opacity="0.95" />
      <path d="M13 20h6" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21 6.5v4.5" stroke="#17356f" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <path d="M10 18h12v9H10v-9Z" fill="#ffffff" opacity="0.18" />
    </svg>
  );
}
