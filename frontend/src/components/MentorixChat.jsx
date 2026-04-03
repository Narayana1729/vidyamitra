import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, X, Send, Loader2, Sparkles, MessageCircle, Bot, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function MentorixChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am Mentorix, your educational assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Hide tooltip after a few seconds initially
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = { role: 'user', content: input.trim(), image: selectedImage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await axios.post(`${API}/api/chatbot`, {
        messages: newMessages
      });
      
      if (res.data && res.data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
      } else {
        throw new Error('No reply received');
      }
    } catch (error) {
      console.error("Mentorix Error:", error);
      setMessages([...newMessages, { role: 'assistant', content: 'Oops! I had a little trouble thinking of an answer. Please try again!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
      
      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            style={{
              position: 'absolute',
              bottom: 75,
              right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '8px 14px',
              borderRadius: '16px 16px 0 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--accent-primary)' }}/>
            I am your Mentorix!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'absolute',
              bottom: 80,
              right: 0,
              width: 360,
              height: 500,
              maxHeight: 'calc(100vh - 120px)',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'var(--accent-gradient)',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '6px',
                  borderRadius: '10px'
                }}>
                  <GraduationCap size={22} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'white' }}>Mentorix</h3>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.9 }}>Your AI Study Buddy</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              // Use a subtle distinct background for messages area to increase readability
              background: 'rgba(0,0,0,0.02)'
            }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={{ flexShrink: 0, background: 'var(--accent-primary)', padding: 6, borderRadius: '50%' }}>
                        <GraduationCap size={14} color="white" />
                      </div>
                    )}
                    <div style={{
                      background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      fontFamily: 'var(--font-body)'
                    }}>
                      {msg.image && (
                        <div style={{ marginBottom: msg.content ? 8 : 0 }}>
                          <img src={msg.image} alt="upload" style={{ maxWidth: '100%', borderRadius: 8 }} />
                        </div>
                      )}
                      {/* Simple map to render paragraphs split by newline */}
                      {msg.content && msg.content.split('\n').map((line, idx) => (
                        <span key={idx}>
                          {line}
                          {idx !== msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ background: 'var(--accent-primary)', padding: 6, borderRadius: '50%' }}>
                      <GraduationCap size={14} color="white" />
                    </div>
                    <div style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      padding: '12px 16px',
                      borderRadius: '16px 16px 16px 0',
                      display: 'flex',
                      gap: 4
                    }}>
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}>•</motion.span>
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}>•</motion.span>
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}>•</motion.span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              {selectedImage && (
                <div style={{ padding: '8px 16px', position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
                  <img src={selectedImage} alt="Preview" style={{ height: 60, borderRadius: 8, border: '1px solid var(--border)' }} />
                  <button
                    onClick={() => setSelectedImage(null)}
                    style={{ position: 'absolute', top: 2, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: 2, cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} style={{
                padding: '12px 16px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Upload Image"
                >
                  <ImageIcon size={20} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Mentorix anything..."
                  style={{
                    flex: 1,
                    background: 'var(--bg-lighter)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '10px 16px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'var(--font-body)'
                  }}
                />
                <button
                  type="submit"
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  style={{
                    background: ((!input.trim() && !selectedImage) || isLoading) ? 'var(--bg-lighter)' : 'var(--accent-primary)',
                    color: ((!input.trim() && !selectedImage) || isLoading) ? 'var(--text-muted)' : 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: 42,
                    height: 42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: ((!input.trim() && !selectedImage) || isLoading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <Send size={18} style={{ marginLeft: 2 }} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 65,
          height: 65,
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          border: 'none',
          boxShadow: '0 8px 24px color-mix(in srgb, var(--accent-primary) 40%, transparent)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} color="white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={32} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
