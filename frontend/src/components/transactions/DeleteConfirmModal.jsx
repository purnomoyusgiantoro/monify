export default function DeleteConfirmModal({ transaction, onCancel, onConfirm }) {
  if (!transaction) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="delete-title">Hapus transaksi?</h2>
        <p>Transaksi <strong>{transaction.name}</strong> akan dihapus dari daftar. Jangan hapus data finansial tanpa konfirmasi.</p>
        <div className="confirm-modal__actions">
          <button type="button" className="button button--secondary" onClick={onCancel}>Batal</button>
          <button type="button" className="button button--danger" onClick={onConfirm}>Hapus</button>
        </div>
      </section>
    </div>
  );
}
