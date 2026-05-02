import { useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import {
  COMPANY_NAME_MAX,
  COMPANY_NAME_MIN,
  validateCompanyName,
} from '@/lib/companyName';

type Props = {
  onConfirm: (name: string) => void;
};

export function CompanyNameModal({ onConfirm }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const result = validateCompanyName(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onConfirm(result.name);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#08204d]/55 backdrop-blur-sm p-4">
      <div
        className="p-6 rounded-2xl max-w-sm w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: '#eef6ff', border: '1px solid var(--line)' }}
          >
            <SvgIcon name="appDog" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: '#173b78' }}>為公司命名</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              一旦取了，這個帳號就無法再改囉
            </p>
          </div>
        </div>

        <label className="block text-xs font-bold mb-1" style={{ color: '#446da8' }}>
          公司名稱（{COMPANY_NAME_MIN}–{COMPANY_NAME_MAX} 字，中英數）
        </label>
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="為公司取個響亮的名字"
          className="w-full px-3 py-2.5 rounded-lg text-base mb-2 outline-none"
          style={{
            background: '#ffffff',
            border: error ? '1px solid #d34a4a' : '1px solid var(--line)',
          }}
        />
        <div className="min-h-[18px] mb-3">
          {error && (
            <span className="text-xs font-bold" style={{ color: '#d34a4a' }}>{error}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg font-extrabold text-base text-white"
          style={{
            background: 'linear-gradient(180deg, #57a8ff, #257ee8)',
            boxShadow: '0 12px 28px rgba(37,126,232,0.32)',
          }}
        >
          確定，開始經營！
        </button>
      </div>
    </div>
  );
}
