import DateButton from './DateButton.jsx';

export default function Topbar({
  title = 'Dashboard',
  description = 'Pantau kondisi keuanganmu di sini',
  selectedDate,
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
        <div className="topbar-actions">
          {action}
          {showDate ? <DateButton date={selectedDate} /> : null}
        </div>
      ) : null}
    </header>
  );
}
