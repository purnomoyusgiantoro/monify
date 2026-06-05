# Data Science & Notebooks

Folder ini berisi skrip, Jupyter Notebook, dan dataset untuk eksperimen Data Science serta Dashboard Keuangan.

## Dataset Transaksi
Letakkan file dataset finansial (CSV) seperti `dataset_transaksi.csv` di folder `notebooks`.

### Format yang Diharapkan
File CSV dengan kolom minimal:
- `deskripsi` — Deskripsi transaksi (teks)
- `jumlah` — Nominal transaksi (angka)
- `kategori` — Label kategori (untuk supervised learning)

### Contoh
```csv
deskripsi,jumlah,kategori
Beli nasi goreng di warteg,15000,Makanan & Minuman
Bayar grab ke kampus,25000,Transportasi
Beli buku kuliah,85000,Pendidikan
```

> ⚠️ File `.csv` tidak di-commit ke Git (sudah ada di .gitignore).
> Bagikan dataset melalui Google Drive atau media lain.

## Dashboard Keuangan

Untuk menjalankan dan melihat visualisasi data transaksi, kami menggunakan Streamlit.
- **Live Demo**: [Streamlit Dashboard](https://projectini-6d2spgubracvgnsipavrkp.streamlit.app/)
- **Source Code Referensi**: [dashboard_keuangan.py](https://github.com/chenida/projectini/blob/main/dashboard_keuangan.py)
