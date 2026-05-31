import DateButton from './DateButton.jsx';

export default function Topbar({
  title = 'Dashboard',
  description = 'Pantau kondisi keuanganmu di sini',
  selectedDate,
  onChangeDate,
  showDate = true,
  action = null,
}) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {(showDate || action) ? (
        <div className="topbar__actions topbar-actions">
          {action}
          {showDate ? <DateButton date={selectedDate} onChange={onChangeDate} /> : null}
        </div>
      ) : null}
    </header>
  );
}
