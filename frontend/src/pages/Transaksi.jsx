import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Topbar from '../components/Topbar.jsx';
import TransactionTabs from '../components/transactions/TransactionTabs.jsx';
import TransactionForm from '../components/transactions/TransactionForm.jsx';
import TransactionList from '../components/transactions/TransactionList.jsx';
import DeleteConfirmModal from '../components/transactions/DeleteConfirmModal.jsx';
import { initialTransactions } from '../data/transactionData.js';
import {
  apiGetTransactions,
  apiCreateTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiGetIncomeCategories,
  apiGetExpenseCategories,
  apiClassify,
} from '../utils/api.js';
import { clearCache, getCache, setCache } from '../utils/cache.js';

function getLocalToday() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function makeEmptyForm() {
  return {
    type: 'income',
    name: '',
    amount: '',
    date: getLocalToday(),
    category: '',
    note: '',
  };
}

export default function Transaksi() {
  const [searchParams] = useSearchParams();
  const routeDateFilter = searchParams.get('date') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState(() => {
    const cached = getCache('transactions');
    return cached ? cached : initialTransactions;
  });
  const [formData, setFormData] = useState(makeEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [classifyTimeout, setClassifyTimeout] = useState(null);
  const [filterDate, setFilterDate] = useState(routeDateFilter); // Empty means all dates

  useEffect(() => {
    setFilterDate(routeDateFilter);
  }, [routeDateFilter]);

  // Fetch transactions + categories on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const cached = getCache('transactions');
      if (cached) {
        return; // Skip fetch karena cache masih valid
      }

      try {
        const [trxRes, incRes, expRes] = await Promise.all([
          apiGetTransactions(),
          apiGetIncomeCategories(),
          apiGetExpenseCategories(),
        ]);

        if (cancelled) return;

        if (trxRes.ok && Array.isArray(trxRes.data.data)) {
          const mapped = trxRes.data.data.map((t) => ({
            id: t.id,
            name: t.description || '',
            amount: Number(t.amount) || 0,
            date: t.transactions_date || '',
            category: t.category_name || 'Lainnya',
            type: t.type || 'expense',
            note: t.note || '',
            // Keep raw IDs for API updates
            _income_category_id: t.income_category_id || null,
            _expense_category_id: t.expense_category_id || null,
          }));
          setCache('transactions', mapped);
          setTransactions(mapped);
        } else {
          setTransactions(initialTransactions);
        }

        if (incRes.ok && Array.isArray(incRes.data.data)) {
          setIncomeCategories(incRes.data.data);
        }
        if (expRes.ok && Array.isArray(expRes.data.data)) {
          setExpenseCategories(expRes.data.data);
        }
      } catch {
        setTransactions(initialTransactions);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (activeTab !== 'all') {
      result = result.filter((t) => t.type === activeTab);
    }
    if (filterDate) {
      result = result.filter((t) => String(t.date).slice(0, 10) === filterDate);
    }
    return result;
  }, [activeTab, filterDate, transactions]);

  // Derive category names from API data
  const incomeCategoryNames = useMemo(() => {
    return incomeCategories.length > 0
      ? incomeCategories.map((c) => c.name)
      : ['Gaji', 'Bonus', 'Investasi',];
  }, [incomeCategories]);

  const expenseCategoryNames = useMemo(() => {
    return expenseCategories.length > 0
      ? expenseCategories.map((c) => c.name)
      : ['Makanan', 'Tagihan', 'Kebutuhan Pokok', 'Pakaian', 'Elektronik', 'Transport', 'Hiburan', 'Lainnya'];
  }, [expenseCategories]);

  function findCategoryId(categoryName, type) {
    const list = type === 'income' ? incomeCategories : expenseCategories;
    const match = list.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
    return match ? match.id : null;
  }

  function handleFormChange(name, value) {
    setFormData((current) => {
      const next = { ...current, [name]: value };

      if (name === 'type') {
        next.category = '';
      }

      if (name === 'name' && next.name.trim().length >= 3) {
        // AI classify (debounced) — berlaku untuk semua tipe transaksi
        next.category = 'Sedang Memprediksi AI...';
        
        if (classifyTimeout) clearTimeout(classifyTimeout);
        const timeout = setTimeout(async () => {
          try {
            const res = await apiClassify(next.name, Number(next.amount) || 0);
            if (res.ok && res.data.data?.kategori_ai) {
              setFormData((prev) => {
                if (prev.name === next.name) {
                  try {
                    let aiCatRaw = (res.data.data.kategori_ai || 'Lainnya').toLowerCase();
                    let isIncome = ['gaji', 'bonus', 'investasi', 'pemasukan', 'income'].some(k => aiCatRaw.includes(k));
                    let mappedCat = '';

                    if (isIncome) {
                      const match = incomeCategoryNames.find(c => c && (aiCatRaw.includes(c.toLowerCase()) || c.toLowerCase().includes(aiCatRaw)));
                      mappedCat = match || incomeCategoryNames[0];
                    } else {
                      const match = expenseCategoryNames.find(c => c && (aiCatRaw.includes(c.toLowerCase()) || c.toLowerCase().includes(aiCatRaw)));
                      if (match) {
                        mappedCat = match;
                      } else {
                        if (aiCatRaw.includes('belanja')) {
                           mappedCat = expenseCategoryNames.find(c => c && c.toLowerCase().includes('kebutuhan')) || 'Lainnya';
                        } else {
                           mappedCat = expenseCategoryNames.includes('Lainnya') ? 'Lainnya' : expenseCategoryNames[0];
                        }
                      }
                    }

                    return { 
                      ...prev, 
                      category: mappedCat || 'Lainnya',
                      type: isIncome ? 'income' : 'expense'
                    };
                  } catch (e) {
                    console.error('Mapping error:', e);
                    return { ...prev, category: expenseCategoryNames.includes('Lainnya') ? 'Lainnya' : expenseCategoryNames[0] };
                  }
                }
                return prev;
              });
            } else {
              setFormData(prev => prev.name === next.name ? { ...prev, category: expenseCategoryNames.includes('Lainnya') ? 'Lainnya' : expenseCategoryNames[0] } : prev);
            }
          } catch (e) {
            console.error('API Error:', e);
            setFormData(prev => prev.name === next.name ? { ...prev, category: expenseCategoryNames.includes('Lainnya') ? 'Lainnya' : expenseCategoryNames[0] } : prev);
          }
        }, 250);
        setClassifyTimeout(timeout);
      }

      return next;
    });
  }

  function resetForm() {
    setFormData(makeEmptyForm());
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const amount = Number(formData.amount);

    if (!name || !amount || amount <= 0) {
      alert('Nama transaksi dan nominal wajib diisi dengan benar.');
      return;
    }

    const categoryName = formData.category || suggestCategory(name, formData.type);

    try {
      if (editingId) {
        // Update via API
        const payload = {
          type: formData.type,
          description: name,
          amount,
          transactions_date: formData.date,
          category_method: 'manual',
        };

        const catId = findCategoryId(categoryName, formData.type);
        if (formData.type === 'income') {
          payload.income_category_id = catId;
        } else {
          payload.expense_category_id = catId;
        }

        const res = await apiUpdateTransaction(editingId, payload);
        if (res.ok) {
          setTransactions((current) =>
            current.map((t) =>
              t.id === editingId
                ? {
                    ...t,
                    name,
                    amount,
                    date: formData.date,
                    category: categoryName,
                    type: formData.type,
                    note: formData.note,
                  }
                : t,
            ),
          );
        } else {
          // Fallback: update locally
          setTransactions((current) =>
            current.map((t) =>
              t.id === editingId
                ? { ...t, name, amount, date: formData.date, category: categoryName, type: formData.type, note: formData.note }
                : t,
            ),
          );
        }
      } else {
        // Create via API
        const payload = {
          type: formData.type,
          description: name,
          amount,
          transactions_date: formData.date,
          category_method: 'manual',
        };

        const catId = findCategoryId(categoryName, formData.type);
        if (formData.type === 'income') {
          payload.income_category_id = catId;
        } else {
          payload.expense_category_id = catId;
        }

        const res = await apiCreateTransaction(payload);
        if (res.ok && res.data.data) {
          const newTrx = {
            id: res.data.data.id,
            name,
            amount,
            date: formData.date,
            category: categoryName,
            type: formData.type,
            note: formData.note,
          };
          setTransactions((current) => [newTrx, ...current]);
        } else {
          // Fallback: add locally
          const newTrx = {
            id: Date.now(),
            name,
            amount,
            date: formData.date,
            category: categoryName,
            type: formData.type,
            note: formData.note,
          };
          setTransactions((current) => [newTrx, ...current]);
        }
      }
    } catch {
      // Fallback: local only
      const localPayload = {
        id: editingId ?? Date.now(),
        name,
        amount,
        date: formData.date,
        category: categoryName,
        type: formData.type,
        note: formData.note,
      };
      if (editingId) {
        setTransactions((current) => current.map((t) => (t.id === editingId ? localPayload : t)));
      } else {
        setTransactions((current) => [localPayload, ...current]);
      }
    }

    clearCache();
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

  async function handleDelete() {
    try {
      const res = await apiDeleteTransaction(deleteTarget.id);
      if (res.ok) {
        setTransactions((current) => current.filter((t) => t.id !== deleteTarget.id));
      } else {
        // Fallback: delete locally
        setTransactions((current) => current.filter((t) => t.id !== deleteTarget.id));
      }
    } catch {
      setTransactions((current) => current.filter((t) => t.id !== deleteTarget.id));
    }

    clearCache();
    if (editingId === deleteTarget.id) resetForm();
    setDeleteTarget(null);
  }

  // Categories for the form
  const formCategories = formData.type === 'income' ? incomeCategoryNames : expenseCategoryNames;

  return (
    <main className="page-main transaksi-main">
      <Topbar
        title="Transaksi"
        description="Catat pemasukan dan pengeluaranmu di satu tempat"
        selectedDate={getLocalToday()}
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
          categories={formCategories}
        />

        <TransactionList
          transactions={filteredTransactions}
          selectedDate={filterDate || getLocalToday()}
          onChangeDate={setFilterDate}
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
