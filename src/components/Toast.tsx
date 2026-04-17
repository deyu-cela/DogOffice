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
      className="fixed top-16 left-1/2 z-[500] px-5 py-3 rounded-2xl text-white font-bold shadow-lg"
      style={{
        transform: 'translateX(-50%)',
        background: isNegative ? 'linear-gradient(180deg, #ff8a8a, #d75d5d)' : 'linear-gradient(180deg, #a6e3a1, #6bcb77)',
        animation: 'toastIn 0.3s ease-out',
      }}
    >
      {toast.msg}
    </div>
  );
}
