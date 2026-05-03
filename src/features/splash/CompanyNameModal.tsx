import { useState } from 'react';
import {
  COMPANY_NAME_MAX,
  COMPANY_NAME_MIN,
  validateCompanyName,
} from '@/lib/companyName';
import './companyNameModal.css';

type Props = {
  onConfirm: (name: string) => void;
};

const PAW_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width={26} height={26} aria-hidden="true">
    <ellipse cx="6.5" cy="9" rx="1.8" ry="2.4" />
    <ellipse cx="17.5" cy="9" rx="1.8" ry="2.4" />
    <ellipse cx="9.5" cy="5" rx="1.6" ry="2.2" />
    <ellipse cx="14.5" cy="5" rx="1.6" ry="2.2" />
    <path d="M12 11c-3 0-5 2.5-5 5 0 2 1.5 3 3 3 1 0 1.3-.5 2-.5s1 .5 2 .5c1.5 0 3-1 3-3 0-2.5-2-5-5-5z" />
  </svg>
);

export function CompanyNameModal({ onConfirm }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = validateCompanyName(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onConfirm(result.name);
  };

  const trimmed = value.trim();
  const tooShort = trimmed.length < COMPANY_NAME_MIN;

  return (
    <div className="cnm-backdrop" role="dialog" aria-labelledby="cnm-title" aria-modal="true">
      <div className="cnm-stack">
        <div className="cnm-back cnm-back--1" aria-hidden="true" />
        <div className="cnm-back cnm-back--2" aria-hidden="true" />
        <form className="cnm-card" onSubmit={handleSubmit}>
          <span className="cnm-tape" aria-hidden="true" />
          <span className="cnm-paw-badge" aria-hidden="true">{PAW_ICON}</span>

          <h2 id="cnm-title" className="cnm-title">為公司命名</h2>
          <div className="cnm-divider" aria-hidden="true" />
          <p className="cnm-subtitle">一旦取了，這個帳號就無法再改囉 🐾</p>

          <label>
            <span className="cnm-label">
              <span className="cnm-label__dot">•</span> 公司名稱（{COMPANY_NAME_MIN}–{COMPANY_NAME_MAX} 字，中英數）
            </span>
            <div className="cnm-field" data-error={error ? 'true' : 'false'}>
              <input
                type="text"
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="為公司取個響亮的名字"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'cnm-err' : undefined}
              />
            </div>
            {error && <span id="cnm-err" className="cnm-err">{error}</span>}
          </label>

          <button type="submit" className="cnm-cta" disabled={tooShort}>
            確定，開始經營！
          </button>
        </form>
      </div>
    </div>
  );
}
