import DateButton from '../DateButton.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function TransactionList({ transactions, selectedDate, onChangeDate, onEdit, onAskDelete }) {
  return (
    <section className="transaction-card transaction-card--list">
      <div className="transaction-list-head">
        <h2>Daftar Transaksi</h2>
        <DateButton date={selectedDate} onChange={onChangeDate} label="Filter tanggal transaksi" />
      </div>

      <div className="full-transaction-list">
        {transactions.length === 0 ? (
          <p className="empty-state">Tidak ada transaksi pada filter ini.</p>
        ) : (
          [...transactions]
            .sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0))
            .map((transaction) => {
            const isIncome = transaction.type === 'income';
            return (
              <article className="full-transaction-row" key={transaction.id}>
                <div className="full-transaction-row__main">
                  <strong>{transaction.name}</strong>
                  <span>{formatDate(transaction.date)}</span>
                </div>

                <strong className="full-transaction-row__category">{transaction.category}</strong>

                <strong className={isIncome ? 'amount amount--income' : 'amount amount--expense'}>
                  {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                </strong>

                <div className="row-actions" aria-label={`Aksi untuk ${transaction.name}`}>
                  <button type="button" aria-label={`Edit ${transaction.name}`} onClick={() => onEdit(transaction)}>
                    <img src="/assets/icon-edit.png" alt="" aria-hidden="true" />
                  </button>
                  <button type="button" aria-label={`Hapus ${transaction.name}`} onClick={() => onAskDelete(transaction)}>
                    <img src="/assets/icon-delete.png" alt="" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
