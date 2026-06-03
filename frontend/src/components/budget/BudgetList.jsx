import ProgressBar from '../ProgressBar.jsx';
import { formatCurrency, getBudgetStatus } from '../../utils/formatters.js';

export default function BudgetList({ rows }) {
  return (
    <section className="budget-page-card budget-page-card--list">
      <h2>Budget Bulan Ini</h2>

      <div className="budget-page-list">
        {rows.length === 0 ? (
          <p className="empty-state">Belum ada budget untuk periode ini.</p>
        ) : (
          rows.map((row) => {
            const status = row.limit > 0
              ? getBudgetStatus(row.percent)
              : { label: 'Belum Diatur', tone: 'warning' };

            return (
              <article className="budget-page-row" key={`${row.period}-${row.category}`}>
                <strong className="budget-page-row__category">{row.category}</strong>
                <div className="budget-page-row__usage">
                  <span>{formatCurrency(row.used)} / {formatCurrency(row.limit)}</span>
                  <ProgressBar
                    value={row.used}
                    max={row.limit}
                    tone={status.tone}
                    label={`${row.category} terpakai ${row.percent}%`}
                  />
                </div>
                <span className={`budget-row__percent budget-row__percent--${status.tone}`}>{row.percent}%</span>
                <span className={`status-pill status-pill--${status.tone}`}>{status.label}</span>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
