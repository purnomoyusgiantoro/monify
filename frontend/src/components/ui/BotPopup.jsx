import React, { useState, useRef, useEffect } from 'react';
import { apiChatBot } from '../../utils/api.js';
import { quickPrompts } from '../../data/predictionData.js';
import { getCache } from '../../utils/cache.js';

export default function BotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Halo! Saya Monify Bot. Ada yang bisa saya bantu hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const togglePopup = () => setIsOpen(!isOpen);

  const handleSend = async (eOrText) => {
    if (eOrText && eOrText.preventDefault) {
      eOrText.preventDefault();
    }
    
    const textValue = typeof eOrText === 'string' ? eOrText : input;
    
    if (!textValue.trim() || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textValue };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = textValue;
    setInput(''); // always clear input just in case
    setIsLoading(true);

    try {
      const metrics = getCache('prediksi') || {};
      const res = await apiChatBot(currentInput, metrics);
      let botText = 'Maaf, saya tidak bisa memproses permintaan saat ini.';
      if (res.ok && res.data && res.data.success) {
        botText = res.data.data.reply;
      }
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botText }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Maaf, terjadi kesalahan jaringan atau layanan sedang sibuk.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

return (
  <div
    style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '16px'
    }}
  >
    {isOpen && (
      <div
        style={{
          width: '340px',
          height: '480px',
          backgroundColor: '#fff',
          borderRadius: '24px',
          boxShadow: '0 12px 40px rgba(16, 35, 29, 0.15)',
          border: '1px solid #e5eee9',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease both',
          transformOrigin: 'bottom right'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #00a870, #087c67)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              background: '#fff', color: '#00a870',
              display: 'grid', placeItems: 'center', fontWeight: '900', fontSize: '18px'
            }}>M</div>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', letterSpacing: '-0.3px', fontWeight: '800' }}>Monify Bot</h4>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, fontWeight: '600' }}>Online</p>
            </div>
          </div>
          <button
            onClick={togglePopup}
            style={{
              background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', opacity: 0.8, padding: 0, lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#f6fbf8'
          }}
        >
          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  style={{
                    backgroundColor: '#e7f8ef',
                    border: '1px solid #bfeeda',
                    color: '#087c67',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d1f4e1'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#e7f8ef'}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                backgroundColor: msg.sender === 'user' ? '#00a870' : '#fff',
                color: msg.sender === 'user' ? '#fff' : '#10231d',
                border: msg.sender === 'user' ? 'none' : '1px solid #e5eee9',
                fontSize: '13px',
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(16, 35, 29, 0.04)'
              }}
            >
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div
              style={{
                alignSelf: 'flex-start',
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                backgroundColor: '#fff',
                color: '#6b7b74',
                border: '1px solid #e5eee9',
                fontSize: '13px',
                fontStyle: 'italic'
              }}
            >
              Mengetik...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #e5eee9' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya Monify..."
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #e5eee9',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '13px',
                backgroundColor: '#f8fcfa',
                color: '#10231d'
              }}
            />
            <button
              type="submit"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#00a870',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 168, 112, 0.2)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    )}

    {/* FAB Button */}
    <button
      onClick={togglePopup}
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        border: 'none',
        background: 'linear-gradient(135deg, #00a870, #087c67)',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 12px 28px rgba(0, 168, 112, 0.35)',
        transition: 'transform 0.2s ease, border-radius 0.2s ease',
        transform: isOpen ? 'scale(0.95)' : 'scale(1)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = isOpen ? 'scale(0.95)' : 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = isOpen ? 'scale(0.95)' : 'scale(1)'}
    >
      {isOpen ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )}
    </button>
  </div>
  );
}