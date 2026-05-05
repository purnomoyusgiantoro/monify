# 💰 MONIFY — Sistem Cerdas Pengelolaan Keuangan Pribadi

Monorepo untuk proyek capstone MONIFY yang menggabungkan **React**, **Express.js**, **FastAPI**, dan **TensorFlow** dalam satu repositori.

## 📁 Struktur Proyek

```
monify/
├── apps/
│   ├── web/            ⚛️  Frontend (React)
│   ├── api/            🟢 Backend (Express.js)
│   └── ai-service/     🐍 Microservice AI (FastAPI + TensorFlow)
├── data-science/       📊 Area Kerja Data Scientist
└── Documentation/      📄 Dokumen Proyek
```

## 👥 Tim & Penanggung Jawab

| Komponen | Penanggung Jawab |
|---|---|
| Frontend (React) | Purnomo Yusgiantoro |
| Backend (Express.js) | Indra Fata Nizar Azizi |
| AI Service (FastAPI) | Faradila Octavia & Mohamad Fajar Mutaqin |
| Data Science | Kristina Ester & Chenida Rira Verlyta |

## 🚀 Cara Menjalankan

### 1. Setup Frontend & Backend (Node.js)
```bash
# Di root folder monify/
npm install

# Jalankan backend (port 5000)
npm run dev:api

# Jalankan frontend (port 3000)
npm run dev:web

# Atau jalankan keduanya sekaligus
npm run dev
```

### 2. Setup AI Service (Python)
```bash
cd apps/ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 🔗 Arsitektur Integrasi

```
React (3000) → Express (5000) → FastAPI (8000)
                    ↓
              JSON File Storage
```

1. **React** mengirim input user ke **Express Backend**
2. **Express** meneruskan request ke **FastAPI AI Service** untuk prediksi
3. **Express** menerima hasil AI dan menyimpan ke file JSON
4. **Express** mengirimkan hasil kembali ke **React** untuk ditampilkan
