from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# import tensorflow as tf  # Uncomment saat model sudah siap

app = FastAPI(
    title="MONIFY AI Service",
    description="Microservice AI untuk klasifikasi kategori transaksi keuangan menggunakan Deep Learning",
    version="1.0.0",
)

# CORS - Izinkan akses dari Express Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# Model Input Schema
# ============================
class TransactionInput(BaseModel):
    deskripsi: str
    jumlah: float

class PredictionOutput(BaseModel):
    deskripsi: str
    kategori_ai: str
    akurasi: float

# ============================
# Daftar Kategori Pengeluaran
# ============================
CATEGORIES = [
    "Makanan & Minuman",
    "Transportasi",
    "Belanja",
    "Tagihan & Utilitas",
    "Hiburan",
    "Kesehatan",
    "Pendidikan",
    "Transfer",
    "Lainnya",
]

# ============================
# Endpoints
# ============================
@app.get("/")
def read_root():
    return {
        "service": "MONIFY AI Service",
        "status": "running",
        "model_loaded": False,  # Ubah ke True saat model sudah di-load
        "categories": CATEGORIES,
    }

@app.post("/predict-category", response_model=PredictionOutput)
def predict_category(data: TransactionInput):
    """
    Menerima deskripsi transaksi dan mengembalikan prediksi kategori.
    
    Saat ini menggunakan dummy response.
    TODO: Load pre-trained Keras model (Softmax/LSTM) dan lakukan prediksi nyata.
    """
    # ===== DUMMY LOGIC (Ganti dengan model TensorFlow) =====
    deskripsi_lower = data.deskripsi.lower()
    
    # Rule-based sederhana sebagai placeholder
    if any(word in deskripsi_lower for word in ["makan", "nasi", "kopi", "minum", "warung", "resto"]):
        kategori = "Makanan & Minuman"
        akurasi = 0.92
    elif any(word in deskripsi_lower for word in ["ojek", "grab", "gojek", "bensin", "parkir", "bus"]):
        kategori = "Transportasi"
        akurasi = 0.88
    elif any(word in deskripsi_lower for word in ["beli", "belanja", "toko", "mall", "online"]):
        kategori = "Belanja"
        akurasi = 0.85
    elif any(word in deskripsi_lower for word in ["listrik", "air", "wifi", "internet", "pulsa"]):
        kategori = "Tagihan & Utilitas"
        akurasi = 0.90
    elif any(word in deskripsi_lower for word in ["nonton", "game", "spotify", "netflix", "hiburan"]):
        kategori = "Hiburan"
        akurasi = 0.87
    elif any(word in deskripsi_lower for word in ["obat", "dokter", "rumah sakit", "apotek"]):
        kategori = "Kesehatan"
        akurasi = 0.91
    elif any(word in deskripsi_lower for word in ["kursus", "buku", "kuliah", "sekolah"]):
        kategori = "Pendidikan"
        akurasi = 0.89
    elif any(word in deskripsi_lower for word in ["transfer", "kirim", "bayar"]):
        kategori = "Transfer"
        akurasi = 0.86
    else:
        kategori = "Lainnya"
        akurasi = 0.60
    
    return PredictionOutput(
        deskripsi=data.deskripsi,
        kategori_ai=kategori,
        akurasi=akurasi,
    )

# Jalankan dengan: uvicorn main:app --reload --port 8000
