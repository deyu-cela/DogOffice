import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { ToolInventoryModal } from '@/features/staff/ToolInventoryModal';
import { UpgradeDialog } from '@/components/UpgradeDialog';

export function FacilityInfoPopup() {
  const id = useUiStore((s) => s.facilityInfoId);
  const close = useUiStore((s) => s.closeFacilityInfo);
  const triggerHint = useGameStore((s) => s.triggerHint);

  useEffect(() => {
    if (id === 'toy') triggerHint('toy');
  }, [id, triggerHint]);

  useEffect(() => {
    if (id !== 'toy') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, close]);

  if (!id) return null;
  if (id === 'toy') return <ToolInventoryModal onClose={close} />;

  return <UpgradeDialog itemId={id} onClose={close} />;
}
