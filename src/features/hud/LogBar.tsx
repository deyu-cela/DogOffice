import { useState } from 'react';
import { Panel } from '@/components/Panel';
import { GameLog } from '@/features/log/GameLog';

export function LogBar() {
  const [open, setOpen] = useState(true);

  return (
    <Panel style={{ padding: 12 }}>
      <div
        className="flex items-center justify-between gap-2 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="text-xs font-bold" style={{ color: 'var(--muted)' }}>
          📜 日誌
        </div>
        <button
          type="button"
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: 'transparent',
            color: '#7a685a',
            border: '1px solid rgba(90,70,54,0.15)',
            boxShadow: 'none',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          {open ? '收起 ▾' : '展開 ▸'}
        </button>
      </div>
      {open && (
        <div className="mt-2" style={{ maxHeight: 140, overflowY: 'auto' }}>
          <GameLog />
        </div>
      )}
    </Panel>
  );
}
