import React, { useEffect, useRef, useState } from 'react';
import { apiChatBot } from '../../utils/api.js';
import { quickPrompts } from '../../data/predictionData.js';
import { getCache } from '../../utils/cache.js';

const POPUP_POSITION_KEY = 'monify_bot_popup_position';
const DESKTOP_MEDIA_QUERY = '(min-width: 821px)';
const VIEWPORT_MARGIN = 16;
const FAB_SIZE = 64;
const POPUP_WIDTH = 340;
const POPUP_HEIGHT = 480;
const STACK_GAP = 16;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getDefaultPosition(isOpen = false) {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }

  return {
    x: Math.max(VIEWPORT_MARGIN, window.innerWidth - FAB_SIZE - 30),
    y: Math.max(VIEWPORT_MARGIN, window.innerHeight - FAB_SIZE - 30),
  };
}

function normalizePosition(position, isOpen = false) {
  if (typeof window === 'undefined') {
    return position;
  }

  const minX = isOpen ? VIEWPORT_MARGIN + (POPUP_WIDTH - FAB_SIZE) : VIEWPORT_MARGIN;
  const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - FAB_SIZE - VIEWPORT_MARGIN);

  const minY = isOpen ? VIEWPORT_MARGIN + POPUP_HEIGHT + STACK_GAP : VIEWPORT_MARGIN;
  const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - FAB_SIZE - VIEWPORT_MARGIN);

  return {
    x: clamp(position.x, minX, maxX),
    y: clamp(position.y, minY, maxY),
  };
}

function loadSavedPosition() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(POPUP_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x !== 'number' || typeof parsed?.y !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function BotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(() => loadSavedPosition() || getDefaultPosition(false));
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Halo! Saya Monify Bot. Ada yang bisa saya bantu hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const dragStateRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const suppressClickRef = useRef(false);

  const togglePopup = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setIsOpen(!isOpen);
  };

  const beginDrag = (event) => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia(DESKTOP_MEDIA_QUERY).matches) return;
    if (event.button != null && event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
      startX: event.clientX,
      startY: event.clientY,
    };
    setIsDragging(true);
  };

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePointerMove = (event) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      if (
        Math.abs(event.clientX - dragState.startX) > 4 ||
        Math.abs(event.clientY - dragState.startY) > 4
      ) {
        suppressClickRef.current = true;
      }

      setPosition((current) =>
        normalizePosition(
          {
            x: event.clientX - dragState.offsetX,
            y: event.clientY - dragState.offsetY,
          },
          isOpen,
        ),
      );
    };

    const stopDrag = () => {
      dragStateRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const normalized = normalizePosition(position, isOpen);
    if (normalized.x !== position.x || normalized.y !== position.y) {
      setPosition(normalized);
      return;
    }
    window.localStorage.setItem(POPUP_POSITION_KEY, JSON.stringify(normalized));
  }, [isOpen, position]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setPosition((current) => normalizePosition(current, isOpen));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

return (
  <div
    style={{
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      zIndex: 9999,
      width: `${FAB_SIZE}px`,
      height: `${FAB_SIZE}px`,
      cursor: isDragging ? 'grabbing' : 'default'
    }}
  >
    {isOpen && (
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          right: 0,
          marginBottom: `${STACK_GAP}px`,
          width: `${POPUP_WIDTH}px`,
          height: `${POPUP_HEIGHT}px`,
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
            justifyContent: 'space-between',
            cursor: 'grab',
            userSelect: 'none'
          }}
          onPointerDown={beginDrag}
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
            onPointerDown={(event) => event.stopPropagation()}
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
        touchAction: 'none',
      }}
      onPointerDown={beginDrag}
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
