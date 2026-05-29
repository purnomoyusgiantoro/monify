import { formatCompactDate } from '../utils/formatters.js';

export default function DateButton({ date, label = 'Pilih tanggal' }) {
  return (
    <button type="button" className="date-picker" aria-label={label}>
      <img className="date-picker__icon" src="/assets/icon-calendar.png" alt="" aria-hidden="true" />
      <span>{formatCompactDate(date)}</span>
      <span aria-hidden="true">v</span>
    </button>
  );
}
