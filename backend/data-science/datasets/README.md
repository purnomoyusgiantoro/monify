# Folder Datasets
Letakkan file dataset finansial (CSV) di folder ini.

## Format yang Diharapkan
File CSV dengan kolom minimal:
- `deskripsi` — Deskripsi transaksi (teks)
- `jumlah` — Nominal transaksi (angka)
- `kategori` — Label kategori (untuk supervised learning)

## Contoh
```csv
deskripsi,jumlah,kategori
Beli nasi goreng di warteg,15000,Makanan & Minuman
Bayar grab ke kampus,25000,Transportasi
Beli buku kuliah,85000,Pendidikan
```

> ⚠️ File `.csv` tidak di-commit ke Git (sudah ada di .gitignore).
> Bagikan dataset melalui Google Drive atau media lain.
