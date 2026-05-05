### 1. Arsitektur Monorepo MONIFY

Kita akan membagi monorepo menjadi 3 aplikasi utama dan 1 direktori riset:

1. **`apps/web`**: Frontend aplikasi menggunakan React (Penanggung jawab: Purnomo Yusgiantoro).
2. **`apps/api`**: Backend utama menggunakan Node.js/Express untuk CRUD, Autentikasi, dan manajemen JSON lokal (Penanggung jawab: Indra Fata Nizar Azizi).
3. **`apps/ai-service`**: Microservice menggunakan Python (FastAPI) khusus untuk menjalankan model TensorFlow Deep Learning (Penanggung jawab: Faradila Octavia & Mohamad Fajar Mutaqin).
4. **`data-science`**: Folder khusus untuk riset, dataset finansial, _feature engineering_, dan file Jupyter Notebook (Penanggung jawab: Kristina Ester & Chenida Rira Verlyta).

---

### 2. Struktur Folder & File Awal

Silakan buat struktur folder seperti di bawah ini di dalam VS Code.

```text
monify-monorepo/
├── .gitignore
├── package.json                 # Konfigurasi Monorepo (NPM Workspaces)
├── README.md
│
├── apps/
│   ├── web/                     # ⚛️ Frontend (React)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── components/      # UI component
│   │   │   └── pages/           # Halaman Dashboard, AI Analysis
│   │   └── public/
│   │
│   ├── api/                     # 🟢 Backend (Express.js)
│   │   ├── package.json
│   │   ├── server.js
│   │   ├── data/                # Penyimpanan JSON lokal (karena tanpa DB riil)
│   │   │   └── transactions.json
│   │   └── routes/
│   │       └── transactionRoutes.js
│   │
│   └── ai-service/              # 🐍 Microservice AI (FastAPI + TensorFlow)
│       ├── requirements.txt
│       ├── main.py
│       └── models/              # Model ML (.h5 / .tflite) disimpan di sini
│
└── data-science/                # 📊 Area Kerja Data Scientist
    ├── datasets/                # Financial Dataset
    ├── notebooks/               # Jupyter Notebooks untuk training model
    └── train_model.py           # Script training LSTM/GRU/ANN
```

---

### 3. File Awal (_Starter Code_)

Berikut adalah isi dari file-file kunci untuk memulai proyek. Anda bisa langsung melakukan _Copy-Paste_.

#### A. Root Directory (Pengaturan Monorepo)

**File:** `package.json` (Di root folder `monify-monorepo/`)
Fungsi: Mengatur agar seluruh aplikasi JavaScript berada dalam satu perintah instalasi.

```json
{
  "name": "monify-monorepo",
  "private": true,
  "workspaces": ["apps/web", "apps/api"],
  "scripts": {
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:api": "npm run dev --workspace=apps/api",
    "dev": "npm run dev:api & npm run dev:web"
  }
}
```

**File:** `.gitignore`

```text
node_modules/
.env
__pycache__/
*.pyc
apps/ai-service/venv/
data-science/datasets/*.csv
apps/api/data/*.json
```

#### B. Backend / API Node.js (Tugas: Indra Fata Nizar Azizi)

**File:** `apps/api/server.js`
Fungsi: Jembatan penghubung Frontend dan AI Service, serta menyimpan data transaksi ke JSON lokal.

```javascript
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Endpoint dasar
app.get("/api/health", (req, res) => {
  res.json({ status: "MONIFY Backend is running!" });
});

// Mock endpoint untuk integrasi ke AI (Bisa diteruskan ke FastAPI)
app.post("/api/predict", async (req, res) => {
  // Nanti Indra akan melakukan HTTP Request (axios) ke port ai-service dari sini
  res.json({ message: "Akan diteruskan ke Python AI Service" });
});

app.listen(PORT, () => {
  console.log(`Backend Server berjalan di http://localhost:${PORT}`);
});
```

#### C. AI Service / Python Backend (Tugas: Faradila & Fajar)

**File:** `apps/ai-service/requirements.txt`

```text
fastapi
uvicorn
tensorflow
pandas
numpy
```

**File:** `apps/ai-service/main.py`
Fungsi: Menjalankan model Dense Layer (ANN) untuk menerima input dari Node.js Backend dan mengembalikan hasil klasifikasi/prediksi.

```python
from fastapi import FastAPI
from pydantic import BaseModel
# import tensorflow as tf (Uncomment saat model sudah siap)

app = FastAPI()

# Definisi format input teks manual dari user
class TransactionInput(BaseModel):
    deskripsi: str
    jumlah: float

@app.get("/")
def read_root():
    return {"message": "MONIFY AI Service is running"}

@app.post("/predict-category")
def predict_category(data: TransactionInput):
    # TODO: Load pre-trained model Keras (Softmax) dan lakukan prediksi
    # Dummy response untuk testing integrasi
    kategori_prediksi = "Makanan & Minuman" # Contoh hasil AI

    return {
        "deskripsi": data.deskripsi,
        "kategori_ai": kategori_prediksi,
        "akurasi": 0.95
    }

# Jalankan dengan: uvicorn main:app --reload --port 8000
```

#### D. Data Science Area (Tugas: Kristina & Chenida)

**File:** `data-science/train_model.py`
Fungsi: Script awal untuk mengolah _Financial Dataset_.

```python
import pandas as pd
import numpy as np

def load_data():
    print("Memuat dataset transaksi finansial...")
    # df = pd.read_csv('datasets/financial_data.csv')
    pass

def preprocess_text():
    print("Mengubah teks nama barang menjadi representasi numerik...")
    # Logika preprocessing (Tokenization, Padding)
    pass

if __name__ == "__main__":
    load_data()
    preprocess_text()
    print("Proses training siap dijalankan.")
```

---

### Cara Tim Anda Bekerja dengan Sistem Ini:

1. **Inisialisasi Pertama (Lakukan oleh Ketua Tim):**
   - Buka terminal di folder `monify-monorepo`.
   - Jalankan `git init`.
   - Lakukan _commit_ struktur dasar ini ke GitHub.
2. **Setup Frontend & Backend (Purnomo & Indra):**
   - Masuk ke folder `monify-monorepo` di terminal.
   - Jalankan `npm install` (akan menginstal dependency untuk web dan api sekaligus).
   - Frontend berjalan di `localhost:3000` (React), Backend Express di `localhost:5000`.
3. **Setup AI & ML (Fajar, Faradila, Kristina, Chenida):**
   - Masuk ke folder `apps/ai-service`.
   - Buat virtual environment: `python -m venv venv`.
   - Aktifkan venv dan install: `pip install -r requirements.txt`.
   - Jalankan FastAPI di port khusus: `uvicorn main:app --reload --port 8000`.
4. **Integrasi:**
   - React (Purnomo) mengirim input ketikan user ke Express Backend (Indra).
   - Express Backend (Indra) memanggil API Python di `localhost:8000/predict-category` (Fajar/Faradila).
   - Express menerima hasil AI dan menyimpannya ke File JSON (sesuai batasan eksklusi tanpa DB bank).
   - Express mengirimkan hasil tersebut kembali ke React untuk ditampilkan di _Dashboard_ pengguna.
