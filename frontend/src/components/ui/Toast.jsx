import { useEffect } from 'react';
import { AlertCircle, Check, Info, X } from 'lucide-react';

const toastIcon = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const tone = ['success', 'error', 'info'].includes(toast.type) ? toast.type : 'info';
  const Icon = toastIcon[tone];

  return (
    <div className={`toast toast--${tone}`} role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">
        <Icon size={16} strokeWidth={2.3} />
      </span>
      <p className="toast__message">{toast.message}</p>
      <button type="button" className="toast__close" aria-label="Tutup notifikasi" onClick={onClose}>
        <X size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}
