import { useMemo, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import TransactionTabs from '../components/transactions/TransactionTabs.jsx';
import TransactionForm from '../components/transactions/TransactionForm.jsx';
import TransactionList from '../components/transactions/TransactionList.jsx';
import DeleteConfirmModal from '../components/transactions/DeleteConfirmModal.jsx';
import { initialTransactions, suggestCategory } from '../data/transactionData.js';

const today = '2026-06-22';
const emptyForm = {
  type: 'income',
  name: '',
  amount: '',
  date: today,
  category: '',
  note: '',
};

export default function Transaksi() {
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'all') return transactions;
    return transactions.filter((transaction) => transaction.type === activeTab);
  }, [activeTab, transactions]);

  function handleFormChange(name, value) {
    setFormData((current) => {
      const next = { ...current, [name]: value };

      if (name === 'type') {
        next.category = '';
      }

      if ((name === 'name' || name === 'type') && next.name.trim()) {
        next.category = suggestCategory(next.name, next.type);
      }

      return next;
    });
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const amount = Number(formData.amount);

    if (!name || !amount || amount <= 0) {
      alert('Nama transaksi dan nominal wajib diisi dengan benar.');
      return;
    }

    const payload = {
      ...formData,
      id: editingId ?? Date.now(),
      name,
      amount,
      category: formData.category || suggestCategory(name, formData.type),
    };

    if (editingId) {
      setTransactions((current) => current.map((transaction) => (transaction.id === editingId ? payload : transaction)));
    } else {
      setTransactions((current) => [payload, ...current]);
    }

    resetForm();
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id);
    setFormData({
      type: transaction.type,
      name: transaction.name,
      amount: String(transaction.amount),
      date: transaction.date,
      category: transaction.category,
      note: transaction.note ?? '',
    });
  }

  function handleDelete() {
    setTransactions((current) => current.filter((transaction) => transaction.id !== deleteTarget.id));
    if (editingId === deleteTarget.id) resetForm();
    setDeleteTarget(null);
  }

  return (
    <main className="page-main transaksi-main">
      <Topbar
        title="Transaksi"
        description="Catat pemasukan dan pengeluaranmu di satu tempat"
        selectedDate={today}
        showDate={false}
      />

      <TransactionTabs activeTab={activeTab} onChange={setActiveTab} />

      <section className="transaction-layout">
        <TransactionForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          editingId={editingId}
          onCancelEdit={resetForm}
        />

        <TransactionList
          transactions={filteredTransactions}
          selectedDate={today}
          onEdit={handleEdit}
          onAskDelete={setDeleteTarget}
        />
      </section>

      <DeleteConfirmModal
        transaction={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
