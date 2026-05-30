import { useState, useRef, useEffect } from 'react';
import { apiChatBot } from '../../utils/api.js';
import { quickPrompts } from '../../data/predictionData.js';

export default function MonifyBot({ metrics }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo! Saya Monify Bot, Asisten Keuangan Pribadimu. Ada yang bisa saya bantu terkait kondisi keuanganmu bulan ini?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  async function sendMessage(value = input) {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiChatBot(trimmed, metrics);
      let botText = 'Maaf, saya tidak bisa memproses permintaan saat ini.';
      
      if (res.ok && res.data.success) {
        botText = res.data.data.reply;
      }
      
      setMessages((current) => [...current, { id: Date.now() + 1, sender: 'bot', text: botText }]);
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, sender: 'bot', text: 'Maaf, terjadi kesalahan jaringan atau layanan sedang sibuk.' }]);
    } finally {
      setLoading(false);
    }
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
            <button type="button" key={prompt} onClick={() => sendMessage(prompt)} disabled={loading}>
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
          {loading && (
            <article className="chat-message chat-message--bot chat-message--loading">
              <span>Mengetik...</span>
            </article>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form className="monify-bot__input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Tanya saran keuangan..."
          aria-label="Kirim pesan Anda"
          disabled={loading}
        />
        <button type="submit" aria-label="Kirim pesan" disabled={loading}>
          <img src="/assets/icon-kirim.png" alt="" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
