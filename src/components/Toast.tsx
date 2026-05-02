import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function Toast() {
  const toast = useGameStore((s) => s.toast);
  const dismiss = useGameStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => dismiss(), 4000);
    return () => clearTimeout(id);
  }, [toast, dismiss]);

  if (!toast) return null;

  const isNegative = toast.type === 'negative';

  return (
    <div
      className="fixed top-16 left-1/2 z-[500] px-5 py-3 rounded-xl font-bold shadow-lg"
      style={{
        transform: 'translateX(-50%)',
        color: isNegative ? '#d74e63' : '#6f966d',
        background: isNegative
          ? 'linear-gradient(180deg, rgba(255,254,254,0.76), rgba(255,232,233,0.68))'
          : 'linear-gradient(180deg, rgba(248,255,244,0.76), rgba(223,238,218,0.68))',
        border: `1px solid ${isNegative ? 'rgba(229,116,132,0.34)' : 'rgba(158,194,156,0.44)'}`,
        boxShadow: '0 12px 24px rgba(166,91,85,0.14), inset 0 0 0 1px rgba(255,255,255,0.48)',
        backdropFilter: 'blur(8px) saturate(1.04)',
        WebkitBackdropFilter: 'blur(8px) saturate(1.04)',
        animation: 'toastIn 0.3s ease-out',
      }}
    >
      {toast.msg}
    </div>
  );
}
