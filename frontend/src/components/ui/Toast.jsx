import { useEffect } from 'react';

const toastIcon = {
  success: '✓',
  error: '!',
  info: 'i',
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const tone = ['success', 'error', 'info'].includes(toast.type) ? toast.type : 'info';

  return (
    <div className={`toast toast--${tone}`} role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">{toastIcon[tone]}</span>
      <p className="toast__message">{toast.message}</p>
      <button type="button" className="toast__close" aria-label="Tutup notifikasi" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
