import { formatCurrency, formatDate } from '../utils/formatters.js';
import { useNavigate } from 'react-router-dom';

export default function TransactionSection({ transactions }) {
  const navigate = useNavigate();
  return (
    <section className="panel-card">
      <div className="section-head">
        <h2>Transaksi terbaru</h2>
        <button type="button" className="small-button" onClick={() => navigate('/transaksi')}>Lihat semua</button>
      </div>

      <div className="transaction-list">
        {transactions.map((transaction) => {
          const isIncome = transaction.type === 'income';
          return (
            <article className="transaction-row" key={`${transaction.name}-${transaction.amount}-${transaction.date}`}>
              <strong>{transaction.name}</strong>
              <span>{formatDate(transaction.date)}</span>
              <span className="transaction-row__category">{transaction.category}</span>
              <strong className={isIncome ? 'amount amount--income' : 'amount amount--expense'}>
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
              </strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}
