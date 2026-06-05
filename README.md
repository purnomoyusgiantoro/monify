# 💰 MONIFY — Sistem Cerdas Pengelolaan Keuangan Pribadi

Banyak individu, terutama generasi muda, yang kesulitan mengelola keuangan karena kurangnya pencatatan dan pemahaman pola konsumsi. **MONIFY** hadir sebagai solusi inovatif yang mengotomatiskan pencatatan dan kategorisasi transaksi keuangan harian Anda dengan memanfaatkan Kecerdasan Buatan (AI).

Proyek *capstone* ini dibangun dengan arsitektur Monorepo yang menggabungkan:

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)

---

## 🔗 Tautan Penting

### 🚀 Deployment Produk
- **Aplikasi Web (Frontend)**: [MONIFY Frontend (Vercel)](https://monify-xi.vercel.app/)
- **Backend API**: [MONIFY API (Vercel)](https://monify-api-two.vercel.app/)
- **AI Service (Model ML)**: [Hugging Face Spaces](https://huggingface.co/spaces/pxy18/ai_v4)

### 📈 Dashboard Data Science
Untuk menjalankan dan melihat visualisasi data transaksi, kami menggunakan Streamlit.
- **Live Demo**: [Streamlit Dashboard](https://projectini-6d2spgubracvgnsipavrkp.streamlit.app/)
- **Source Code Referensi**: [dashboard_keuangan.py](https://github.com/chenida/projectini/blob/main/dashboard_keuangan.py)

### 📹 Media & Presentasi

**1. Video Presentasi (Pitching) 10 Menit**  
[![Video Presentasi](https://img.youtube.com/vi/wMPuAO88emI/maxresdefault.jpg)](https://youtu.be/wMPuAO88emI)

**2. Video Demo Penggunaan Produk**  
[![Video Demo Penggunaan](https://img.youtube.com/vi/cZSFpbb0LGE/maxresdefault.jpg)](https://youtu.be/cZSFpbb0LGE)

- **Slide Presentasi (Pitch Deck)**: [Lihat di Canva](https://canva.link/rl7x5qsyar3ojf6)

### 📊 Data & Riset
- **Dataset Transaksi Keuangan**: [Unduh via Google Drive](https://drive.google.com/file/d/1SAafOz-Rva2I7XmXlZEncXIC97ezMwG1/view?usp=drive_link)

---

## 🛠️ Teknologi (Tech Stack)

Sistem ini dibangun dengan arsitektur terpisah (Microservices/Monorepo) yang menggunakan teknologi berikut:
- **Frontend**: React.js (Aplikasi Antarmuka Pengguna)
- **Backend API**: Node.js & Express.js (Rest API Utama)
- **AI & Machine Learning**: Python, FastAPI, TensorFlow/Keras, Scikit-learn (Pemrosesan dan Prediksi Kategori)
- **Data Science & Dashboard**: Jupyter Notebook, Pandas, Streamlit

---

## 📁 Struktur Proyek (Tree)

```text
monify-monorepo/
├── frontend/           ⚛️  Frontend Web App (React)
├── backend/
│   ├── api/            🟢 REST API Utama (Node.js + Express.js)
│   ├── ai-service/     🐍 Microservice Machine Learning (Python + FastAPI + TensorFlow)
│   └── data-science/   📊 Eksperimen Model, Notebooks, Dashboard Keuangan (Streamlit), Dataset
└── Documentation/      📄 Dokumen Pendukung Proyek (Arsitektur, Panduan, dll)
```

---

## 👥 Tim & Penanggung Jawab

| Komponen | Penanggung Jawab |
|---|---|
| Frontend (React) | Indra Fata Nizar Azizi |
| Backend (Express.js) | Purnomo Yusgiantoro|
| AI Service (FastAPI) | Faradila Octavia & Mohamad Fajar Mutaqin |
| Data Science | Kristina Ester & Chenida Rira Verlyta |

---

## 🚀 Cara Menjalankan Secara Lokal

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

---

## 🔗 Arsitektur Integrasi

```text
React (3000) → Express (5000) → FastAPI (8000)
                    ↓
              JSON File Storage
```

1. **React** mengirim input teks atau transaksi dari pengguna ke **Express Backend**.
2. **Express** meneruskan *request* tersebut ke **FastAPI AI Service** untuk dilakukan klasifikasi prediksi.
3. **FastAPI** membalas dengan kategori (misal: "Makanan & Minuman").
4. **Express** menerima hasil AI, kemudian menyimpannya ke file JSON lokal (sebagai penyimpanan).
5. **Express** mengirimkan respons terakhir kembali ke **React** untuk divisualisasikan pada *Dashboard* pengguna.
