import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUiStore } from '@/store/uiStore';
import './forge.css';

const FORGE_URL = `${import.meta.env.BASE_URL}game/Forge/forge_demo.html`;

export function ForgeModal() {
  const open = useUiStore((s) => s.forgeModalOpen);
  const close = useUiStore((s) => s.closeForgeModal);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  return createPortal(
    <div
      className="forge-backdrop fixed inset-0 z-[900] flex items-center justify-center p-2"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="鍛造爐"
    >
      <div
        className="forge-modal flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="forge-modal__header">
          <span className="forge-modal__title">健身房・鍛造爐</span>
          <button type="button" onClick={close} className="forge-modal__close">
            關閉
          </button>
        </div>
        <iframe
          src={FORGE_URL}
          title="鍛造爐"
          className="forge-modal__iframe"
        />
      </div>
    </div>,
    document.body,
  );
}
