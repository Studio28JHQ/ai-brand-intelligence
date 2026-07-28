'use client';

import { useRef, useState } from 'react';
import { useTranslations } from '../../../lib/i18n/client';

export function ConfirmButton({
  label,
  confirmLabel,
  confirmDescription,
  variant = 'secondary',
  onConfirm,
  disabled,
}: {
  label: string;
  confirmLabel?: string;
  confirmDescription?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const tCommon = useTranslations('common');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    await onConfirm();
    setBusy(false);
    dialogRef.current?.close();
  };

  return (
    <>
      <button type="button" className={`btn btn-${variant}`} disabled={disabled} onClick={() => dialogRef.current?.showModal()}>
        {label}
      </button>
      <dialog ref={dialogRef} className="dialog">
        <p className="dialog__title">{confirmLabel ?? tCommon('areYouSure')}</p>
        {confirmDescription && <p className="text-secondary">{confirmDescription}</p>}
        <div className="cluster">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={handleConfirm}>
            {busy ? tCommon('working') : tCommon('confirm')}
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => dialogRef.current?.close()}>
            {tCommon('cancel')}
          </button>
        </div>
      </dialog>
    </>
  );
}
