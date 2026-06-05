# 📡 MONIFY — Dokumentasi API Lengkap

> **Base URL Produksi:** `https://monify-api-two.vercel.app`  
> **Base URL Lokal:** `http://localhost:5000`  
> **Versi API:** `2.0.0`  
> **Format Respons:** `application/json`

---

## 🔐 Autentikasi

Sebagian besar endpoint memerlukan JWT Token yang dikirim melalui header:

```
Authorization: Bearer <token>
```

Token diperoleh setelah berhasil melakukan **Register** atau **Login**.

---

## 📋 Daftar Endpoint

| Grup | Prefix | Keterangan |
|------|--------|------------|
| [Auth](#-auth) | `/api/auth` | Registrasi, Login, Profil |
| [Transaksi](#-transaksi) | `/api/transactions` | CRUD Transaksi |
| [Kategori](#-kategori) | `/api/categories` | Kategori Pemasukan & Pengeluaran |
| [Budget](#-budget) | `/api/budgets` | Manajemen Budget Bulanan |
| [Dashboard](#-dashboard) | `/api/dashboard` | Ringkasan & Statistik |
| [Laporan](#-laporan) | `/api/reports` | Laporan Harian/Bulanan/Tahunan |
| [AI](#-ai--machine-learning) | `/api/ai` | Prediksi, Klasifikasi, Chatbot |
| [Health](#-health-check) | `/api/health` | Status Server |

---

## 🔑 Auth

### `POST /api/auth/register`
Mendaftarkan user baru.

**Auth:** ❌ Tidak diperlukan

**Request Body:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `name` | string | ✅ | Nama lengkap user |
| `email` | string | ✅ | Alamat email unik |
| `password` | string | ✅ | Minimal 6 karakter |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Registrasi berhasil.",
  "data": {
    "user": {
      "id": "uuid-xxx",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "created_at": "2025-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```

**Error Responses:**
| Status | Pesan |
|--------|-------|
| `400` | Nama, email, dan password wajib diisi. |
| `400` | Password minimal 6 karakter. |
| `400` | Email sudah terdaftar. |

---

### `POST /api/auth/login`
Login user yang sudah terdaftar.

**Auth:** ❌ Tidak diperlukan

**Request Body:**
```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": "uuid-xxx",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "created_at": "2025-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```

**Error Responses:**
| Status | Pesan |
|--------|-------|
| `400` | Email dan password wajib diisi. |
| `401` | Email atau password salah. |

---

### `POST /api/auth/logout`
Logout (invalidasi token di sisi client).

**Auth:** ✅ Diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Logout berhasil. Hapus token di client."
}
```

---

### `GET /api/auth/me`
Mengambil informasi profil user yang sedang login.

**Auth:** ✅ Diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "created_at": "2025-01-01T00:00:00Z",
    "update_at": "2025-01-05T00:00:00Z"
  }
}
```

---

### `PUT /api/auth/profile`
Memperbarui nama dan/atau email user.

**Auth:** ✅ Diperlukan

**Request Body:**
```json
{
  "name": "Budi Santoso Baru",
  "email": "budi.baru@example.com"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `name` | string | ❌ | Nama baru (opsional) |
| `email` | string | ❌ | Email baru (opsional) |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui.",
  "data": {
    "id": "uuid-xxx",
    "name": "Budi Santoso Baru",
    "email": "budi.baru@example.com",
    "update_at": "2025-01-10T00:00:00Z"
  }
}
```

---

### `PUT /api/auth/password`
Mengubah password user.

**Auth:** ✅ Diperlukan

**Request Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `oldPassword` | string | ✅ | Password lama |
| `newPassword` | string | ✅ | Password baru (min. 6 karakter) |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Password berhasil diperbarui."
}
```

---

## 💸 Transaksi

### `GET /api/transactions`
Mengambil daftar seluruh transaksi user yang sedang login.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `type` | string | Filter tipe: `income` atau `expense` |
| `category_id` | string | Filter berdasarkan ID kategori |
| `start_date` | string | Filter tanggal mulai (`YYYY-MM-DD`) |
| `end_date` | string | Filter tanggal akhir (`YYYY-MM-DD`) |
| `limit` | number | Batasi jumlah data yang dikembalikan |

**Contoh Request:**
```
GET /api/transactions?type=expense&start_date=2025-01-01&end_date=2025-01-31&limit=10
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "user_id": "uuid-yyy",
      "type": "expense",
      "amount": 50000,
      "description": "Makan siang",
      "transactions_date": "2025-01-15",
      "expense_category_id": "uuid-cat",
      "category_name": "Makanan & Minuman",
      "category_method": "ai",
      "note": "Nasi padang",
      "created_at": "2025-01-15T12:00:00Z"
    }
  ],
  "total": 1
}
```

---

### `GET /api/transactions/:id`
Mengambil detail satu transaksi berdasarkan ID.

**Auth:** ✅ Diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "type": "expense",
    "amount": 50000,
    "description": "Makan siang",
    "category_name": "Makanan & Minuman"
  }
}
```

**Error:** `404` — Transaksi tidak ditemukan.

---

### `POST /api/transactions`
Menambahkan transaksi baru.

**Auth:** ✅ Diperlukan

**Request Body:**
```json
{
  "type": "expense",
  "amount": 50000,
  "description": "Makan siang",
  "transactions_date": "2025-01-15",
  "expense_category_id": "uuid-cat",
  "category_method": "ai",
  "note": "Nasi padang"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `type` | string | ✅ | `income` atau `expense` |
| `amount` | number | ✅ | Nominal (harus > 0) |
| `description` | string | ✅ | Deskripsi transaksi |
| `transactions_date` | string | ❌ | Format `YYYY-MM-DD`, default hari ini |
| `income_category_id` | string | ❌ | ID kategori (jika type=income) |
| `expense_category_id` | string | ❌ | ID kategori (jika type=expense) |
| `category_method` | string | ❌ | `manual` atau `ai` |
| `note` | string | ❌ | Catatan tambahan |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Transaksi berhasil ditambahkan.",
  "data": { ... }
}
```

---

### `PUT /api/transactions/:id`
Memperbarui data transaksi.

**Auth:** ✅ Diperlukan

**Request Body:** *(semua field opsional)*
```json
{
  "amount": 75000,
  "description": "Makan siang + minuman",
  "note": "Di restoran"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Transaksi berhasil diperbarui.",
  "data": { ... }
}
```

---

### `DELETE /api/transactions/:id`
Menghapus transaksi berdasarkan ID.

**Auth:** ✅ Diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Transaksi berhasil dihapus."
}
```

---

## 🏷️ Kategori

### `GET /api/categories/income`
Mengambil daftar semua kategori pemasukan.

**Auth:** ❌ Tidak diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "name": "Gaji",
      "icon": "wallet",
      "color": "#10B981"
    }
  ]
}
```

---

### `GET /api/categories/expense`
Mengambil daftar semua kategori pengeluaran.

**Auth:** ❌ Tidak diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "name": "Makanan & Minuman",
      "icon": "coffee",
      "color": "#EF4444"
    }
  ]
}
```

---

### `POST /api/categories/income`
Menambahkan kategori pemasukan baru.

**Auth:** ✅ Diperlukan

**Request Body:**
```json
{
  "name": "Freelance",
  "icon": "laptop",
  "color": "#3B82F6"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `name` | string | ✅ | Nama kategori (unik) |
| `icon` | string | ❌ | Nama ikon, default: `wallet` |
| `color` | string | ❌ | Warna hex, default: `#10B981` |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Kategori pemasukan berhasil ditambahkan.",
  "data": { ... }
}
```

---

### `POST /api/categories/expense`
Menambahkan kategori pengeluaran baru.

**Auth:** ✅ Diperlukan

**Request Body:**
```json
{
  "name": "Hobi",
  "icon": "gamepad",
  "color": "#8B5CF6"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `name` | string | ✅ | Nama kategori (unik) |
| `icon` | string | ❌ | Nama ikon, default: `coffee` |
| `color` | string | ❌ | Warna hex, default: `#EF4444` |

---

### `DELETE /api/categories/income/:id`
Menghapus kategori pemasukan berdasarkan ID.

**Auth:** ✅ Diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Kategori pemasukan berhasil dihapus."
}
```

---

### `DELETE /api/categories/expense/:id`
Menghapus kategori pengeluaran berdasarkan ID.

**Auth:** ✅ Diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Kategori pengeluaran berhasil dihapus."
}
```

---

## 💰 Budget

### `GET /api/budgets`
Mengambil daftar semua budget user beserta informasi penggunaan.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `start_date` | string | Filter periode mulai |
| `end_date` | string | Filter periode akhir |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "expense_category_id": "uuid-cat",
      "category_name": "Makanan & Minuman",
      "amount": 1000000,
      "month": 1,
      "year": 2025,
      "start_date": "2025-01-01",
      "end_date": "2025-01-31",
      "used_amount": 350000,
      "remaining": 650000,
      "usage_percentage": 35
    }
  ],
  "total": 1
}
```

---

### `GET /api/budgets/:id`
Mengambil detail satu budget berdasarkan ID.

**Auth:** ✅ Diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "category_name": "Makanan & Minuman",
    "amount": 1000000,
    "used_amount": 350000,
    "remaining": 650000,
    "usage_percentage": 35
  }
}
```

---

### `POST /api/budgets`
Membuat budget baru untuk kategori dan bulan tertentu.

**Auth:** ✅ Diperlukan

**Request Body:**
```json
{
  "expense_category_id": "uuid-cat",
  "amount": 1000000,
  "month": 1,
  "year": 2025
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `expense_category_id` | string | ✅ | ID kategori pengeluaran |
| `amount` | number | ✅ | Limit budget (harus > 0) |
| `month` | number | ❌ | Bulan (1-12), default bulan ini |
| `year` | number | ❌ | Tahun (YYYY), default tahun ini |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Budget berhasil dibuat.",
  "data": { ... }
}
```

**Error:** `400` — Budget untuk kategori dan periode ini sudah ada.

---

### `PUT /api/budgets/:id`
Memperbarui data budget.

**Auth:** ✅ Diperlukan

**Request Body:** *(semua field opsional)*
```json
{
  "amount": 1500000,
  "month": 2,
  "year": 2025
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Budget berhasil diperbarui.",
  "data": { ... }
}
```

---

### `DELETE /api/budgets/:id`
Menghapus budget berdasarkan ID.

**Auth:** ✅ Diperlukan

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Budget berhasil dihapus."
}
```

---

## 📊 Dashboard

### `GET /api/dashboard/summary`
Mengambil ringkasan keuangan bulan berjalan termasuk balance, prediksi AI, dan safe-to-spend.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `date` | string | Tanggal referensi (`YYYY-MM-DD`), default hari ini |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "balance": 2500000,
    "total_income": 5000000,
    "total_expense": 2500000,
    "total_budget": 3000000,
    "projected_expense": 3200000,
    "risk_percentage": 80,
    "safe_to_spend": 85000,
    "safe_to_spend_daily": 90000,
    "safe_to_spend_today_remaining": 85000,
    "expense_today": 5000,
    "days_remaining": 16,
    "days_in_month": 31,
    "current_day": 15,
    "total_transactions": 42,
    "month": "2025-01"
  }
}
```

| Field | Keterangan |
|-------|------------|
| `balance` | Saldo bulan ini (income - expense) |
| `projected_expense` | Prediksi total pengeluaran akhir bulan |
| `risk_percentage` | Persentase risiko overbudget (0-140%) |
| `safe_to_spend` | Batas aman belanja hari ini (sisa) |
| `safe_to_spend_daily` | Batas aman belanja per hari |
| `expense_today` | Total pengeluaran hari ini |

---

### `GET /api/dashboard/expense-by-category`
Mengambil rincian pengeluaran bulan ini dikelompokkan per kategori.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `date` | string | Tanggal referensi (`YYYY-MM-DD`), default hari ini |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "total_expense": 2500000,
    "month": "2025-01",
    "categories": [
      {
        "category_id": "uuid-cat",
        "category_name": "Makanan & Minuman",
        "amount": 800000,
        "count": 15,
        "percentage": 32,
        "budget_limit": 1000000,
        "budget_usage": 80
      }
    ]
  }
}
```

---

### `GET /api/dashboard/history`
Mengambil riwayat transaksi terbaru.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `limit` | number | Jumlah transaksi yang dikembalikan (default: 10) |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "type": "expense",
      "amount": 50000,
      "description": "Makan siang",
      "category_name": "Makanan & Minuman",
      "transactions_date": "2025-01-15"
    }
  ],
  "total": 10
}
```

---

## 📈 Laporan

### `GET /api/reports/daily`
Laporan keuangan harian.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `date` | string | Tanggal target (`YYYY-MM-DD`), default hari ini |

**Contoh Request:**
```
GET /api/reports/daily?date=2025-01-15
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "period": "2025-01-15",
    "period_type": "daily",
    "total_income": 0,
    "total_expense": 50000,
    "balance": -50000,
    "transaction_count": 1,
    "top_category": {
      "category_name": "Makanan & Minuman",
      "amount": 50000
    },
    "category_breakdown": [ ... ],
    "transactions": [ ... ]
  }
}
```

---

### `GET /api/reports/monthly`
Laporan keuangan bulanan lengkap termasuk ringkasan budget.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `month` | string | Bulan target (`YYYY-MM`), default bulan ini |

**Contoh Request:**
```
GET /api/reports/monthly?month=2025-01
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "period": "2025-01",
    "period_type": "monthly",
    "total_income": 5000000,
    "total_expense": 2500000,
    "balance": 2500000,
    "transaction_count": 42,
    "top_category": {
      "category_name": "Makanan & Minuman",
      "amount": 800000
    },
    "category_breakdown": [ ... ],
    "budget_summary": [
      {
        "category_name": "Makanan & Minuman",
        "limit": 1000000,
        "used": 800000,
        "remaining": 200000,
        "percentage": 80
      }
    ],
    "transactions": [ ... ]
  }
}
```

---

### `GET /api/reports/yearly`
Laporan keuangan tahunan dengan breakdown per bulan.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `year` | string | Tahun target (`YYYY`), default tahun ini |

**Contoh Request:**
```
GET /api/reports/yearly?year=2025
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "period": "2025",
    "period_type": "yearly",
    "total_income": 60000000,
    "total_expense": 30000000,
    "balance": 30000000,
    "transaction_count": 504,
    "monthly_breakdown": {
      "2025-01": {
        "income": 5000000,
        "expense": 2500000,
        "balance": 2500000,
        "transaction_count": 42
      }
    }
  }
}
```

---

## 🤖 AI & Machine Learning

### `POST /api/ai/classify`
Mengklasifikasikan kategori transaksi secara otomatis menggunakan model ML (Hugging Face Spaces).

**Auth:** ✅ Diperlukan

**Request Body:**
```json
{
  "deskripsi": "Beli nasi padang di warung makan"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `deskripsi` | string | ✅ | Deskripsi transaksi yang akan diklasifikasi |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "deskripsi": "Beli nasi padang di warung makan",
    "kategori_ai": "Makanan & Minuman",
    "akurasi": 0.95,
    "source": "huggingface_model"
  }
}
```

| Field | Keterangan |
|-------|------------|
| `kategori_ai` | Kategori yang diprediksi AI |
| `akurasi` | Skor kepercayaan model (0.0 - 1.0) |
| `source` | `huggingface_model` atau `fallback_default` |

---

### `POST /api/ai/predict`
Membuat prediksi pengeluaran akhir bulan dan menyimpan hasilnya.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `date` | string | Tanggal referensi (`YYYY-MM-DD`), default hari ini |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Prediksi AI berhasil dibuat.",
  "data": {
    "id": "uuid-xxx",
    "predicted_monthly_expense": 3200000,
    "safe_to_spend_today": 85000,
    "safe_to_spend_daily": 90000,
    "safe_to_spend_today_remaining": 85000,
    "overbudget_status": "warning",
    "recommendation": "Hati-hati, pengeluaran mulai mendekati batas budget. Safe-to-spend hari ini: Rp 85.000.",
    "risk_percentage": 80,
    "total_budget": 3000000,
    "current_expense": 2500000,
    "days_remaining": 16,
    "expense_today": 5000,
    "created_at": "2025-01-15T12:00:00Z"
  }
}
```

| Field | Keterangan |
|-------|------------|
| `overbudget_status` | `safe` / `warning` / `over_budget` |
| `risk_percentage` | Persentase risiko (0-140%) |
| `recommendation` | Pesan rekomendasi dari AI |

---

### `GET /api/ai/predictions`
Mengambil histori prediksi AI yang telah dibuat.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `limit` | number | Batasi jumlah data yang dikembalikan |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [ ... ],
  "total": 5
}
```

---

### `GET /api/ai/safe-to-spend`
Menghitung batas aman pengeluaran untuk hari ini berdasarkan budget dan transaksi berjalan.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `date` | string | Tanggal referensi (`YYYY-MM-DD`), default hari ini |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "safe_to_spend_today": 85000,
    "safe_to_spend_daily": 90000,
    "safe_to_spend_today_remaining": 85000,
    "total_budget": 3000000,
    "current_expense": 2500000,
    "days_remaining": 16,
    "expense_today": 5000
  }
}
```

---

### `GET /api/ai/overbudget`
Memeriksa status risiko overbudget berdasarkan proyeksi pengeluaran.

**Auth:** ✅ Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `date` | string | Tanggal referensi (`YYYY-MM-DD`), default hari ini |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "risk_percentage": 80,
    "status": "warning",
    "projected_expense": 3200000,
    "total_budget": 3000000,
    "current_expense": 2500000,
    "category_breakdown": [
      {
        "category_id": "uuid-cat",
        "category_name": "Makanan & Minuman",
        "limit": 1000000,
        "used": 800000,
        "percentage": 80
      }
    ]
  }
}
```

| Status | Keterangan |
|--------|------------|
| `safe` | Pengeluaran di bawah 80% budget |
| `warning` | Pengeluaran antara 80-99% budget |
| `over_budget` | Pengeluaran melebihi 100% budget |

---

### `POST /api/ai/chat`
Mengirim pesan ke Monify Bot — chatbot AI keuangan berbasis OpenRouter (Gemini Flash).

**Auth:** ❌ Tidak diperlukan (API Key dikonfigurasi di server)

**Request Body:**
```json
{
  "message": "Bagaimana cara menghemat pengeluaran bulan ini?",
  "metrics": {
    "totalBudget": 3000000,
    "monthlyExpense": 2500000,
    "remainingBudget": 500000,
    "monthlyPrediction": 3200000,
    "safeToSpendToday": 85000,
    "riskPercent": 80
  }
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `message` | string | ✅ | Pesan pertanyaan user |
| `metrics` | object | ✅ | Data keuangan user untuk konteks AI |
| `metrics.totalBudget` | number | ❌ | Total budget bulan ini |
| `metrics.monthlyExpense` | number | ❌ | Total pengeluaran bulan ini |
| `metrics.remainingBudget` | number | ❌ | Sisa budget |
| `metrics.monthlyPrediction` | number | ❌ | Prediksi pengeluaran akhir bulan |
| `metrics.safeToSpendToday` | number | ❌ | Batas aman belanja hari ini |
| `metrics.riskPercent` | number | ❌ | Persentase risiko overbudget |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "reply": "Halo! Berdasarkan kondisi keuangan kamu saat ini, pengeluaran sudah mencapai 83% dari budget. Berikut 2 langkah yang bisa kamu lakukan..."
  }
}
```

---

## ✅ Health Check

### `GET /api/health`
Memeriksa status server dan menampilkan daftar endpoint yang tersedia.

**Auth:** ❌ Tidak diperlukan

**Response `200 OK`:**
```json
{
  "status": "MONIFY Backend is running!",
  "version": "2.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "transactions": "/api/transactions",
    "categories": "/api/categories",
    "budgets": "/api/budgets",
    "ai": "/api/ai",
    "dashboard": "/api/dashboard",
    "reports": "/api/reports"
  }
}
```

---

## ⚠️ Format Respons Error

Semua error mengikuti format standar berikut:

```json
{
  "success": false,
  "message": "Deskripsi error dalam bahasa Indonesia."
}
```

| HTTP Status | Keterangan |
|-------------|------------|
| `400` | Bad Request — Input tidak valid |
| `401` | Unauthorized — Token tidak valid atau tidak ada |
| `404` | Not Found — Data tidak ditemukan |
| `500` | Internal Server Error — Kesalahan server |

---

## 🔧 Environment Variables

| Variable | Keterangan |
|----------|------------|
| `PORT` | Port server (default: 5000) |
| `JWT_SECRET` | Secret key untuk JWT token |
| `SUPABASE_URL` | URL Supabase project |
| `SUPABASE_KEY` | API Key Supabase |
| `AI_SERVICE_URL` | URL Hugging Face Space AI |
| `HUGGINGFACE_API_TOKEN` | Token API Hugging Face (opsional) |
| `OPENROUTER_API_KEY` | API Key OpenRouter untuk chatbot |
| `OPENROUTER_MODEL` | Model LLM (default: `google/gemini-2.5-flash`) |

---

*Dokumentasi ini dibuat otomatis berdasarkan source code MONIFY Backend v2.0.0*
