import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters.js';
import { quickPrompts } from '../../data/predictionData.js';

function createBotReply(message, metrics) {
  const text = message.toLowerCase();

  if (text.includes('aman') || text.includes('safe') || text.includes('belanja hari')) {
    return `Batas aman belanja hari ini adalah ${formatCurrency(metrics.safeToSpendToday)}. Angka ini dihitung dari sisa budget dibagi sisa hari bulan ini.`;
  }

  if (text.includes('risiko') || text.includes('overbudget') || text.includes('over budget')) {
    return `Risiko over budget kamu saat ini ${metrics.riskPercent}% dengan status ${metrics.status.label}. Prediksi akhir bulan berada di ${formatCurrency(metrics.monthlyPrediction)} dari total budget ${formatCurrency(metrics.totalBudget)}.`;
  }

  if (text.includes('kategori') || text.includes('boros') || text.includes('terbesar')) {
    return `Kategori terbesar bulan ini adalah ${metrics.highestCategory.category} sebesar ${formatCurrency(metrics.highestCategory.amount)}. Mulai evaluasi dari kategori itu dulu, jangan langsung memotong semua kategori.`;
  }

  if (text.includes('saran') || text.includes('hemat') || text.includes('kurangi')) {
    return metrics.suggestions.join(' ');
  }

  return 'Saya bisa bantu jawab soal batas aman belanja, risiko overbudget, kategori paling boros, dan saran hemat berdasarkan data transaksi serta budget bulan ini.';
}

export default function MonifyBot({ metrics }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo Indra, saya Monify Bot. Saya bisa bantu membaca kondisi budget, safe-to-spend, dan risiko overbudget kamu.',
    },
  ]);
  const [input, setInput] = useState('');

  function sendMessage(value = input) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const userMessage = { id: Date.now(), sender: 'user', text: trimmed };
    const botMessage = {
      id: Date.now() + 1,
      sender: 'bot',
      text: createBotReply(trimmed, metrics),
    };

    setMessages((current) => [...current, userMessage, botMessage]);
    setInput('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <section className="monify-bot" aria-label="Monify Bot">
      <header className="monify-bot__header">MONIFY BOT</header>

      <div className="monify-bot__body">
        <div className="quick-prompts" aria-label="Pertanyaan cepat">
          {quickPrompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => sendMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <article className={`chat-message chat-message--${message.sender}`} key={message.id}>
              {message.text}
            </article>
          ))}
        </div>
      </div>

      <form className="monify-bot__input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Kirim pesan Anda"
          aria-label="Kirim pesan Anda"
        />
        <button type="submit" aria-label="Kirim pesan">
          <img src="/assets/icon-kirim.png" alt="" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
