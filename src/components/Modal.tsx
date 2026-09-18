import { useEffect, useRef, type ReactNode } from 'react';
import { t } from '../i18n/he';

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="relative rounded-[20px] border border-line p-6 w-[min(440px,calc(100%-30px))] text-ink shadow-[0_25px_100px_#0f162040] backdrop:bg-[#0f16205c] backdrop:backdrop-blur-[3px]"
    >
      <button
        type="button"
        aria-label={t.common.close}
        onClick={onClose}
        className="absolute left-3.5 top-3 text-xl text-muted"
      >
        ×
      </button>
      <div>{children}</div>
    </dialog>
  );
}
