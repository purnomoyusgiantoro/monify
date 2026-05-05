import { useState } from 'react';
import axios from 'axios';
import './AIAnalysis.css';

function AIAnalysis() {
  const [deskripsi, setDeskripsi] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/predict', {
        deskripsi,
        jumlah: parseFloat(jumlah),
      });
      setResult(response.data);
    } catch (error) {
      setResult({ error: 'Gagal terhubung ke server. Pastikan backend berjalan.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container ai-analysis">
      <section className="animate-fade-in">
        <h1 className="page-title">
          🤖 <span className="gradient-text">AI Analysis</span>
        </h1>
        <p className="page-subtitle">
          Masukkan deskripsi transaksi untuk mendapatkan prediksi kategori otomatis dari model Deep Learning.
        </p>
      </section>

      {/* Input Form */}
      <form className="glass-card predict-form animate-fade-in-delay-1" onSubmit={handlePredict}>
        <div className="form-group">
          <label htmlFor="deskripsi">Deskripsi Transaksi</label>
          <input
            id="deskripsi"
            type="text"
            placeholder="Contoh: Beli nasi goreng di warteg"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="jumlah">Jumlah (Rp)</label>
          <input
            id="jumlah"
            type="number"
            placeholder="Contoh: 15000"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? '⏳ Menganalisis...' : '🔍 Prediksi Kategori'}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="glass-card result-card animate-fade-in">
          {result.error ? (
            <div className="result-error">
              <span>⚠️</span>
              <p>{result.error}</p>
            </div>
          ) : (
            <div className="result-success">
              <h3>Hasil Prediksi AI</h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">Deskripsi</span>
                  <span className="result-value">{result.deskripsi || deskripsi}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Kategori AI</span>
                  <span className="result-value highlight">{result.kategori_ai || result.message}</span>
                </div>
                {result.akurasi && (
                  <div className="result-item">
                    <span className="result-label">Tingkat Akurasi</span>
                    <span className="result-value">{(result.akurasi * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIAnalysis;
