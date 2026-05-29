import { transactionTabs } from '../../data/transactionData.js';

export default function TransactionTabs({ activeTab, onChange }) {
  return (
    <div className="transaction-tabs" aria-label="Filter transaksi">
      {transactionTabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`transaction-tabs__button ${activeTab === tab.value ? 'is-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
