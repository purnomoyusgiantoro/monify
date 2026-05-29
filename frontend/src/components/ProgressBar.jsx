export default function ProgressBar({ value, max = 100, tone = 'success', label }) {
  const percent = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className="progress" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent} role="progressbar">
      <span className={`progress__fill progress__fill--${tone}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
