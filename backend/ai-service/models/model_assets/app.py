
import gradio as gr
import tensorflow as tf
import pickle
import numpy as np
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load Model dan Aset
model = tf.keras.models.load_model('transaction_classifier_model.keras')
with open('tokenizer.pkl', 'rb') as f:
    tokenizer = pickle.load(f)
with open('label_encoder.pkl', 'rb') as f:
    encoder = pickle.load(f)

def predict_api(description):
    # Preprocessing
    seq = tokenizer.texts_to_sequences([description])
    padded = pad_sequences(seq, maxlen=20, padding='post')

    # Prediksi
    prediction = model.predict(padded, verbose=0)
    class_idx = np.argmax(prediction, axis=1)[0]
    category = encoder.inverse_transform([class_idx])[0]
    confidence = float(np.max(prediction))

    return {"category": category, "confidence": confidence}

# Interface Gradio
demo = gr.Interface(
    fn=predict_api,
    inputs=gr.Textbox(label="Deskripsi Transaksi"),
    outputs=gr.JSON(label="Hasil Klasifikasi"),
    title="Transaction Classifier API"
)

if __name__ == "__main__":
    demo.launch()
