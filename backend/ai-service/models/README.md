# Transaction Classifier Model (ai-service)

Direktori ini berisi segala hal yang berkaitan dengan model Machine Learning yang digunakan pada layanan AI (ai-service) Monify. Model ini berfungsi untuk melakukan klasifikasi kategori transaksi berdasarkan teks deskripsi transaksi.

## 1. Ikhtisar Model
Model ini dibangun menggunakan **TensorFlow** dan **Keras**. Arsitektur utama dari model ini adalah **LSTM (Long Short-Term Memory)**, yang terbukti cukup andal untuk memproses data teks (sequence).

* **Tujuan**: Memprediksi `kategori` (label) dari sebuah `deskripsi` (input teks) transaksi.
* **Tipe Kasus**: Multi-class Text Classification.

## 2. Dataset & Preprocessing
* **Dataset**: Menggunakan data (seperti `dataset_transaksi.csv`).
* **Fitur Utama**: Kolom `deskripsi`.
* **Target / Label**: Kolom `kategori`.
* **Split Data**: Data dibagi menjadi 80% untuk *training* dan 20% untuk *testing* (menggunakan `train_test_split` dengan `random_state=42`).

### Preprocessing Teks
* Menggunakan `Tokenizer` dari TensorFlow Keras dengan batas kata maksimal (`max_words`) sebanyak **5000** kata.
* Kata yang tidak dikenali akan ditandai dengan token `<OOV>` (Out of Vocabulary).
* Menggunakan teknik padding teks (`pad_sequences`) dengan panjang maksimal kalimat (`max_len`) sebanyak **20** kata (menggunakan pola *post-padding*).

### Preprocessing Label
* Menggunakan `LabelEncoder` dari library `scikit-learn` untuk mengubah teks nama kategori transaksi menjadi nilai numerik berurutan.

## 3. Arsitektur Model Deep Learning
Model disusun secara sekuensial dengan struktur layer sebagai berikut:
1. **Embedding Layer**: Memetakan indeks kata ke dalam vektor ruang padat (`input_dim=5000`, `output_dim=64`, `input_length=20`).
2. **SpatialDropout1D Layer** (0.2): Digunakan pada layer embedding untuk secara spesifik mencegah/mengurangi risiko *overfitting*.
3. **LSTM Layer** (128 unit): Layer *Recurrent* untuk mengekstraksi dan mempelajari konteks urutan kata. Dikonfigurasi dengan parameter `dropout=0.2` dan `recurrent_dropout=0.2`.
4. **Dense Layer** (64 unit): Layer feed-forward (Fully Connected) dengan fungsi aktivasi `ReLU`.
5. **Output Dense Layer**: Layer untuk klasifikasi akhir dengan jumlah unit (neuron) disesuaikan dengan banyaknya kategori kelas transaksi. Memakai fungsi aktivasi `Softmax` agar keluaran berupa probabilitas di masing-masing kelas.

### Kompilasi Model
* **Loss Function**: `sparse_categorical_crossentropy` (karena target numerik tidak di-*one-hot-encode*).
* **Optimizer**: `adam`
* **Metrik Evaluasi**: `accuracy`

## 4. Pelatihan Model (Training)
Berdasarkan log yang ada di file *notebook* (`ai_v4.ipynb`), parameter pelatihan secara umum adalah sebagai berikut:
* **Epochs**: Dijalankan sebanyak 15 epoch.
* **Batch Size**: 32
* Hasil pelatihan menunjukkan model bisa beradaptasi secara optimal dengan dataset yang diberikan dengan indikasi akurasi sangat tinggi pada data *training* maupun data validasi/testing.

## 5. Aset Model & Ekspor
Setelah model berhasil dilatih, tiga (*3*) objek/aset sangat penting diekspor untuk kebutuhan *deployment* atau *inference*:
1. **`transaction_classifier_model.keras`**: File model komprehensif yang memuat seluruh bobot (weights), arsitektur model Keras, dan optimizer state.
2. **`tokenizer.pkl`**: Objek `Tokenizer` (*pickle*) yang sebelumnya dipasang (*fit*) pada data *training*, krusial agar kata di data baru di-ubah ke index numerik secara konsisten/sama.
3. **`label_encoder.pkl`**: Objek `LabelEncoder` (*pickle*), agar hasil prediksi model berupa angka bisa diterjemahkan (inverse transform) kembali menjadi teks nama kategori awal.

Ketiga file aset ini juga dibungkus ke dalam **`model_assets.zip`** guna mempermudah proses distribusi dan pemindahan aset ke server atau layanan *cloud*.

## 6. API Deployment (Gradio)
Pada sistem *backend* / AI, model ini dirancang untuk juga bisa diluncurkan (melalui *serving*) menggunakan antarmuka atau API dari pustaka **Gradio** (`app.py`).

Skrip tersebut (*app.py*) memuat seluruh aset *Pickle* & *Keras*, lalu memberikan rute fungsi `predict_api` yang menerima teks (deskripsi transaksi) dan membalas dengan objek JSON yang berisi dua properti:
* `category`: Nama kelas (kategori) hasil prediksi (misalnya: "Belanja", "Transportasi", dsb).
* `confidence`: Nilai keyakinan model (dari skala 0.0 - 1.0) atas prediksi tersebut.

**Live Demo**: [Gradio di Hugging Face Spaces](https://huggingface.co/spaces/pxy18/ai_v4)

### Library Dependensi (`requirements.txt`)
Dependensi minimum yang diperlukan untuk menjalankan sistem AI ini antara lain:
* `tensorflow`
* `pandas`
* `numpy`
* `scikit-learn`
* `gradio`
