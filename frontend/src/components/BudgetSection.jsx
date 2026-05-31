import ProgressBar from './ProgressBar.jsx';
import { formatCurrency, getBudgetStatus } from '../utils/formatters.js';
import { useNavigate } from 'react-router-dom';

export default function BudgetSection({ budgets }) {
  const navigate = useNavigate();
  const totalBudget = budgets.reduce((total, item) => total + item.limit, 0);
  const totalUsed = budgets.reduce((total, item) => total + item.used, 0);
  const totalPercent = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

  return (
    <section className="panel-card dashboard-budget-card">
      <div className="section-head dashboard-budget-head">
        <h2>Budget bulan ini</h2>
        <button type="button" className="small-button dashboard-budget-action" onClick={() => navigate('/budget')}>Lihat semua</button>
      </div>

      <div className="budget-list dashboard-budget-list">
        {budgets.map((item) => {
          const percent = item.limit > 0 ? Math.round((item.used / item.limit) * 100) : 0;
          const status = getBudgetStatus(percent);

          return (
            <div className="budget-row dashboard-budget-row" key={item.category}>
              <strong className="dashboard-budget-row__category">{item.category}</strong>
              <span className="budget-row__usage-inline dashboard-budget-row__usage">
                {formatCurrency(item.used)} / {formatCurrency(item.limit)}
              </span>
              <ProgressBar value={item.used} max={item.limit} tone={status.tone} label={`Budget ${item.category}`} />
              <span className={`budget-row__percent dashboard-budget-row__percent budget-row__percent--${status.tone}`}>{percent}%</span>
              <span className={`status-pill dashboard-budget-row__status status-pill--${status.tone}`}>{status.label}</span>
            </div>
          );
        })}
      </div>

      <div className="budget-summary dashboard-budget-summary">
        <div className="dashboard-budget-summary__item">
          <span>Total Budget</span>
          <strong>{formatCurrency(totalBudget)}</strong>
        </div>
        <div className="dashboard-budget-summary__item">
          <span>Total Terpakai</span>
          <strong>{formatCurrency(totalUsed)}</strong>
        </div>
        <div className="dashboard-budget-summary__item dashboard-budget-summary__item--percent">
          <span>Persentase terpakai</span>
          <strong>{totalPercent}%</strong>
        </div>
      </div>
    </section>
  );
}
