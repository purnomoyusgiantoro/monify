import { budgetCategories } from '../../data/budgetData.js';
import { formatPeriod } from '../../utils/formatters.js';

export default function BudgetForm({ formData, onChange, onSubmit }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onChange(name, value);
  }

  return (
    <section className="budget-page-card budget-page-card--form">
      <h2>Atur Budget</h2>

      <form className="budget-form" onSubmit={onSubmit}>
        <label className="form-field form-field--wide">
          <span>Kategori</span>
          <select name="category" value={formData.category} onChange={handleChange}>
            {budgetCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        <label className="form-field form-field--wide">
          <span>Limit Budget</span>
          <div className="amount-input">
            <strong>Rp</strong>
            <input
              name="limit"
              type="number"
              min="0"
              placeholder="0"
              value={formData.limit}
              onChange={handleChange}
            />
          </div>
        </label>

        <label className="form-field form-field--wide">
          <span>Periode</span>
          <div className="date-input">
            <img src="/assets/icon-calendar.png" alt="" aria-hidden="true" />
            <input
              name="period"
              type="month"
              value={formData.period}
              onChange={handleChange}
              aria-label={`Periode ${formatPeriod(formData.period)}`}
            />
          </div>
        </label>

        <button type="submit" className="button button--primary budget-form__submit">
          Simpan Budget
        </button>
      </form>
    </section>
  );
}
