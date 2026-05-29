import { formatCurrency } from '../../utils/formatters.js';

export default function PredictionCard({ title, description, value, valueType = 'currency', children }) {
  const displayValue = valueType === 'percent' ? `${value}%` : formatCurrency(value);

  return (
    <article className="prediction-card">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <strong className="prediction-card__value">{displayValue}</strong>
      {children}
    </article>
  );
}
