import { getCategoriesByType, transactionTypes } from '../../data/transactionData.js';
import { formatCompactDate } from '../../utils/formatters.js';

export default function TransactionForm({ formData, onChange, onSubmit, editingId, onCancelEdit }) {
  const categories = getCategoriesByType(formData.type);
  const selectedType = transactionTypes.find((type) => type.value === formData.type) ?? transactionTypes[0];

  function handleChange(event) {
    const { name, value } = event.target;
    onChange(name, value);
  }

  return (
    <section className="transaction-card transaction-card--form">
      <h2>{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>

      <form className="transaction-form" onSubmit={onSubmit}>
        <label className="form-field">
          <span>Jenis Transaksi</span>
          <div className="select-box select-box--with-icon">
            <img src={selectedType.icon} alt="" aria-hidden="true" />
            <select name="type" value={formData.type} onChange={handleChange}>
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </label>

        <label className="form-field">
          <span>Nama Transaksi</span>
          <input
            name="name"
            type="text"
            placeholder="Contoh: Gaji Bulanan"
            value={formData.name}
            onChange={handleChange}
          />
        </label>

        <label className="form-field form-field--nominal">
          <span>Nominal</span>
          <div className="amount-input">
            <strong>Rp</strong>
            <input
              name="amount"
              type="number"
              min="0"
              placeholder="0"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
        </label>

        <label className="form-field">
          <span>Tanggal</span>
          <div className="date-input">
            <img src="/assets/icon-calendar.png" alt="" aria-hidden="true" />
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              aria-label={`Tanggal ${formatCompactDate(formData.date)}`}
            />
          </div>
        </label>

        <label className="form-field form-field--wide">
          <span>Kategori</span>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="">Kategori akan dibantu AI</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <small>AI memberi saran kategori dari nama transaksi. User tetap bisa mengubah kalau hasilnya salah.</small>
        </label>

        <label className="form-field form-field--wide">
          <span>Catatan</span>
          <textarea
            name="note"
            placeholder="Tambah catatan jika perlu"
            value={formData.note}
            onChange={handleChange}
          />
        </label>

        <div className="transaction-form__actions">
          {editingId ? (
            <button type="button" className="button button--secondary" onClick={onCancelEdit}>
              Batal Edit
            </button>
          ) : null}
          <button type="submit" className="button button--primary">
            {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </section>
  );
}
