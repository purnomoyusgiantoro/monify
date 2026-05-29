import { formatCurrency } from '../utils/formatters.js';

export default function StatCard({
  title,
  value,
  icon,
  variant = 'default',
  size = 'small',
  description,
  trend,
  trendType = 'positive',
  children,
}) {
  const hasTrend = typeof trend === 'number';

  return (
    <article className={`stat-card stat-card--${size}`}>
      <div className="stat-card__header">
        {icon && <img className="stat-card__icon" src={icon} alt="" aria-hidden="true" />}
        <h2>{title}</h2>
      </div>

      <div className={`stat-card__value stat-card__value--${variant}`}>{formatCurrency(value)}</div>

      {description && <p className="stat-card__description">{description}</p>}

      {hasTrend && (
        <p className={`stat-card__trend stat-card__trend--${trendType}`}>
          <span>{trendType === 'negative' ? '↑' : '↑'} {trend}%</span>
          <span>dari minggu lalu</span>
        </p>
      )}

      {children}
    </article>
  );
}
