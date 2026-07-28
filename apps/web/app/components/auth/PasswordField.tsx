'use client';

import { useState } from 'react';
import { useTranslations } from '../../../lib/i18n/client';

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  const tAuth = useTranslations('auth');
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          className="input"
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          type="button"
          className="password-field__toggle"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? tAuth('hidePassword') : tAuth('showPassword')}
          aria-pressed={visible}
        >
          {visible ? tAuth('hide') : tAuth('show')}
        </button>
      </div>
    </div>
  );
}
