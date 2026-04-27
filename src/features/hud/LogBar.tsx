import { useState } from 'react';
import { Panel } from '@/components/Panel';
import { GameLog } from '@/features/log/GameLog';
import { SvgIcon } from '@/components/SvgIcon';

export function LogBar() {
  const [open, setOpen] = useState(true);

  return (
    <Panel style={{ padding: 12 }}>
      <div
        className="flex items-center justify-between gap-2 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 text-xs font-extrabold" style={{ color: 'var(--text)' }}>
          <SvgIcon name="log" size={16} />
          公司日誌
        </div>
        <button
          type="button"
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: 'transparent',
            color: 'var(--muted)',
            border: '1px solid var(--line)',
            boxShadow: 'none',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          {open ? '收起' : '展開'}
        </button>
      </div>
      {open && (
        <div className="mt-2">
          <GameLog />
        </div>
      )}
    </Panel>
  );
}
