import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md', closeOnBackdrop = true, closeOnEsc = true, onEsc }) {
  // Esc ile kapatma — TÜM modallarda varsayılan davranış. onEsc verilirse önce o çalışır
  // (ör. ödeme faturası kilidi onay ister); verilmezse closeOnEsc=true iken doğrudan kapatır.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (onEsc) onEsc();
      else if (closeOnEsc) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onEsc, onClose, closeOnEsc]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={closeOnBackdrop ? onClose : undefined} />
      <div className={`relative w-full ${maxWidth} card p-6 animate-[fadeIn_.15s_ease]`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
