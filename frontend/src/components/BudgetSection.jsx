import ProgressBar from './ProgressBar.jsx';
import { formatCurrency, getBudgetStatus } from '../utils/formatters.js';
import { useNavigate } from 'react-router-dom';

export default function BudgetSection({ budgets }) {
  const navigate = useNavigate();
  const totalBudget = budgets.reduce((total, item) => total + item.limit, 0);
  const totalUsed = budgets.reduce((total, item) => total + item.used, 0);
  const totalPercent = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

  return (
    <section className="panel-card">
      <div className="section-head">
        <h2>Budget bulan ini</h2>
        <button type="button" className="small-button" onClick={() => navigate('/budget')}>Lihat semua</button>
      </div>

      <div className="budget-list">
        {budgets.map((item) => {
          const percent = item.limit > 0 ? Math.round((item.used / item.limit) * 100) : 0;
          const status = getBudgetStatus(percent);

          return (
            <div className="budget-row" key={item.category}>
              <strong>{item.category}</strong>
              <ProgressBar value={item.used} max={item.limit} tone={status.tone} label={`Budget ${item.category}`} />
              <span className={`budget-row__percent budget-row__percent--${status.tone}`}>{percent}%</span>
              <span className={`status-pill status-pill--${status.tone}`}>{status.label}</span>
            </div>
          );
        })}
      </div>

      <div className="budget-summary">
        <div>
          <span>Total Budget</span>
          <strong>{formatCurrency(totalBudget)}</strong>
        </div>
        <div>
          <span>Total Terpakai</span>
          <strong>{formatCurrency(totalUsed)}</strong>
        </div>
        <div>
          <span>Persentase terpakai</span>
          <strong>{totalPercent}%</strong>
        </div>
      </div>
    </section>
  );
}
