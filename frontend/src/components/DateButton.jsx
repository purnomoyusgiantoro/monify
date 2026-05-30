import { useRef } from 'react';
import { formatCompactDate } from '../utils/formatters.js';

export default function DateButton({ date, label = 'Pilih tanggal', onChange }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current && inputRef.current.showPicker) {
      inputRef.current.showPicker();
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" className="date-picker" aria-label={label} onClick={handleClick}>
        <img className="date-picker__icon" src="/assets/icon-calendar.png" alt="" aria-hidden="true" />
        <span>{formatCompactDate(date)}</span>
      </button>
      <input
        ref={inputRef}
        type="date"
        value={date || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          // Sembunyikan sepenuhnya dari interaksi pointer agar button tetap merespon hover
          // kecuali di browser lama yang tidak mendukung showPicker.
          pointerEvents: typeof HTMLInputElement !== 'undefined' && 'showPicker' in HTMLInputElement.prototype ? 'none' : 'auto',
        }}
        aria-label={label}
        tabIndex={-1}
      />
    </div>
  );
}
