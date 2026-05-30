import { formatCompactDate } from '../utils/formatters.js';

export default function DateButton({ date, label = 'Pilih tanggal', onChange }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" className="date-picker" aria-label={label}>
        <img className="date-picker__icon" src="/assets/icon-calendar.png" alt="" aria-hidden="true" />
        <span>{formatCompactDate(date)}</span>
      </button>
      <input
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
        }}
        aria-label={label}
      />
    </div>
  );
}
