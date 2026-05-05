"""
MONIFY — Script Training Model Deep Learning
=============================================
Script ini digunakan untuk:
1. Memuat dan membersihkan dataset transaksi finansial
2. Melakukan preprocessing teks (tokenization, padding)
3. Melatih model klasifikasi kategori (LSTM/GRU/ANN)
4. Menyimpan model terlatih ke format .h5 / .keras

Penanggung Jawab: Kristina Ester & Chenida Rira Verlyta
"""

import pandas as pd
import numpy as np
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import LabelEncoder
# import tensorflow as tf
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Dense, LSTM, Embedding, Dropout
# from tensorflow.keras.preprocessing.text import Tokenizer
# from tensorflow.keras.preprocessing.sequence import pad_sequences


# ============================
# 1. Memuat Dataset
# ============================
def load_data(filepath='datasets/financial_data.csv'):
    """Memuat dataset transaksi finansial dari file CSV."""
    print("📂 Memuat dataset transaksi finansial...")
    # df = pd.read_csv(filepath)
    # print(f"   ✅ Dataset dimuat: {df.shape[0]} baris, {df.shape[1]} kolom")
    # return df
    print("   ⚠️  Dataset belum tersedia. Silakan letakkan file CSV di folder datasets/")
    return None


# ============================
# 2. Preprocessing Teks
# ============================
def preprocess_text(df, text_column='deskripsi', max_words=5000, max_len=50):
    """
    Mengubah teks deskripsi transaksi menjadi representasi numerik.
    - Tokenization: mengubah kata menjadi angka
    - Padding: menyamakan panjang setiap sekuens
    """
    print("🔧 Melakukan preprocessing teks...")
    # tokenizer = Tokenizer(num_words=max_words, oov_token='<OOV>')
    # tokenizer.fit_on_texts(df[text_column])
    # sequences = tokenizer.texts_to_sequences(df[text_column])
    # padded = pad_sequences(sequences, maxlen=max_len, padding='post', truncating='post')
    # print(f"   ✅ Preprocessing selesai. Shape: {padded.shape}")
    # return padded, tokenizer
    print("   ⚠️  Preprocessing belum bisa dijalankan tanpa dataset")
    return None, None


# ============================
# 3. Training Model
# ============================
def build_model(vocab_size=5000, embedding_dim=64, max_len=50, num_classes=9):
    """
    Membangun arsitektur model Deep Learning untuk klasifikasi kategori.
    Opsi arsitektur:
    - Dense Layer (ANN) — sederhana, cepat training
    - LSTM — bagus untuk data sekuensial
    - GRU — alternatif LSTM yang lebih ringan
    """
    print("🏗️  Membangun arsitektur model...")
    # model = Sequential([
    #     Embedding(vocab_size, embedding_dim, input_length=max_len),
    #     LSTM(128, return_sequences=False),
    #     Dropout(0.3),
    #     Dense(64, activation='relu'),
    #     Dropout(0.2),
    #     Dense(num_classes, activation='softmax'),
    # ])
    # model.compile(
    #     optimizer='adam',
    #     loss='sparse_categorical_crossentropy',
    #     metrics=['accuracy'],
    # )
    # model.summary()
    # return model
    print("   ⚠️  Model belum bisa dibangun tanpa TensorFlow terinstall")
    return None


def train_model(model, X_train, y_train, X_val, y_val, epochs=20, batch_size=32):
    """Melatih model dengan data training."""
    print("🚀 Memulai training model...")
    # history = model.fit(
    #     X_train, y_train,
    #     validation_data=(X_val, y_val),
    #     epochs=epochs,
    #     batch_size=batch_size,
    #     verbose=1,
    # )
    # return history
    print("   ⚠️  Training belum bisa dijalankan")
    return None


# ============================
# 4. Simpan Model
# ============================
def save_model(model, filepath='../apps/ai-service/models/category_classifier.h5'):
    """Menyimpan model terlatih ke file .h5"""
    print(f"💾 Menyimpan model ke {filepath}...")
    # model.save(filepath)
    # print("   ✅ Model berhasil disimpan!")
    print("   ⚠️  Belum ada model untuk disimpan")


# ============================
# Main Pipeline
# ============================
if __name__ == "__main__":
    print("=" * 50)
    print("  MONIFY — Training Pipeline")
    print("=" * 50)
    print()
    
    # Step 1: Load data
    df = load_data()
    
    # Step 2: Preprocess
    X, tokenizer = preprocess_text(df)
    
    # Step 3: Build model
    model = build_model()
    
    # Step 4: Train (uncomment saat data & model siap)
    # X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)
    # history = train_model(model, X_train, y_train, X_val, y_val)
    
    # Step 5: Save
    # save_model(model)
    
    print()
    print("✅ Proses training pipeline siap dijalankan.")
    print("   Langkah selanjutnya:")
    print("   1. Letakkan dataset CSV di folder datasets/")
    print("   2. Install dependencies: pip install tensorflow pandas numpy scikit-learn")
    print("   3. Uncomment kode dan jalankan ulang script ini")
