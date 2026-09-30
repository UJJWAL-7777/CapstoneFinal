import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown, Minimize2, ArrowRight, Navigation } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import './chatbot.css';

const CHATBOT_API = 'http://localhost:5001/api/chat';

const WELCOME = {
  client: {
    text: "Hello! 👋 I'm **LexBot**, your LegalConnect assistant.\n\nI can help you navigate the platform, book consultations, track cases, and answer legal questions. Try asking me anything or use the quick links below!",
    suggestions: ['Book a consultation', 'Track my case', 'Find an advocate', 'Help'],
    quickActions: [
      { label: '🔍 Find Advocates', path: '/client/advocates' },
      { label: '📋 My Cases', path: '/client/cases' },
      { label: '📅 Consultations', path: '/client/consultations' },
    ],
  },
  advocate: {
    text: "Hello! 👋 I'm **LexBot**, your practice assistant.\n\nI can help you manage consultations, track earnings, update availability, and more. What would you like to do?",
    suggestions: ['View consultations', 'Check earnings', 'Update availability', 'Help'],
    quickActions: [
      { label: '📅 Consultations', path: '/advocate/consultations' },
      { label: '💰 Earnings', path: '/advocate/earnings' },
      { label: '🕐 Availability', path: '/advocate/availability' },
    ],
  },
  admin: {
    text: "Hello! 👋 I'm **LexBot**, your admin assistant.\n\nI can help you navigate the admin panel, check stats, and manage operations.",
    suggestions: ['Platform overview', 'Pending verifications', 'View analytics', 'Help'],
    quickActions: [
      { label: '📊 Dashboard', path: '/admin/dashboard' },
      { label: '✅ Verifications', path: '/admin/verification' },
      { label: '📈 Analytics', path: '/admin/analytics' },
    ],
  },
};

function md(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="cb-code">$1</code>')
    .replace(/^(\d+)\.\s+/gm, '<span class="cb-num">$1.</span> ')
    .replace(/^[•]\s+/gm, '<span class="cb-bullet">•</span> ')
    .replace(/\n/g, '<br/>');
}

function TypingDots() {
  return (
    <div className="cb-typing">
      <span className="cb-dot" /><span className="cb-dot" /><span className="cb-dot" />
    </div>
  );
}

function NavLinks({ links, onNavigate }) {
  if (!links?.length) return null;
  return (
    <div className="cb-nav-links">
      {links.map((link, i) => (
        <button key={i} className="cb-nav-btn" onClick={() => onNavigate(link.path)}>
          <span className="cb-nav-icon">{link.icon}</span>
          <div className="cb-nav-info">
            <span className="cb-nav-label">{link.label}</span>
            {link.desc && <span className="cb-nav-desc">{link.desc}</span>}
          </div>
          <ArrowRight size={14} className="cb-nav-arrow" />
        </button>
      ))}
    </div>
  );
}

function QuickActions({ actions, onNavigate }) {
  if (!actions?.length) return null;
  return (
    <div className="cb-quick-actions">
      {actions.map((a, i) => (
        <button key={i} className="cb-quick-btn" onClick={() => onNavigate(a.path)}>
          {a.label}
        </button>
      ))}
    </div>
  );
}

function Chips({ items, onSelect, disabled }) {
  if (!items?.length) return null;
  return (
    <div className="cb-chips">
      {items.map((s, i) => (
        <button key={i} onClick={() => onSelect(s)} disabled={disabled} className="cb-chip">{s}</button>
      ))}
    </div>
  );
}

function Message({ msg, isUser, onNavigate }) {
  return (
    <div className={`cb-msg ${isUser ? 'cb-msg-user' : 'cb-msg-bot'}`}>
      <div className={`cb-avatar ${isUser ? 'cb-avatar-user' : 'cb-avatar-bot'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className="cb-msg-content">
        <div className={`cb-bubble ${isUser ? 'cb-bubble-user' : 'cb-bubble-bot'}`}>
          <div dangerouslySetInnerHTML={{ __html: md(msg.text) }} />
          <span className="cb-time">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {!isUser && msg.navLinks?.length > 0 && (
          <NavLinks links={msg.navLinks} onNavigate={onNavigate} />
        )}
        {!isUser && msg.quickActions?.length > 0 && (
          <QuickActions actions={msg.quickActions} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}

export default function ChatbotWidget() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const endRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [ready, setReady] = useState(false);

  if (!isAuthenticated || !user) return null;
  const role = user.role || 'client';

  const handleNavigate = useCallback((path) => {
    if (!path) return;
    navigate(path);
    setIsOpen(false);
    setIsMinimized(false);
  }, [navigate]);

  useEffect(() => {
    if (isOpen && !ready) {
      const w = WELCOME[role] || WELCOME.client;
      setMessages([{
        id: 'welcome',
        text: w.text,
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: w.suggestions,
        quickActions: w.quickActions,
        navLinks: [],
      }]);
      setReady(true);
    }
  }, [isOpen, ready, role]);

  const scrollDown = useCallback((smooth = true) => {
    endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (messages.length) scrollDown();
  }, [messages, isTyping, scrollDown]);

  const handleScroll = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    setShowScroll(c.scrollHeight - c.scrollTop - c.clientHeight > 80);
  }, []);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    setMessages(p => [...p, {
      id: `u-${Date.now()}`,
      text: msg,
      isUser: true,
      timestamp: new Date().toISOString(),
    }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(CHATBOT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userRole: role, userName: user.name }),
      });
      const json = await res.json();
      await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

      const data = json.data;

      // Auto-navigate if there's exactly one nav link and intent is navigation
      if (data.intent === 'navigation' && data.navLinks?.length === 1) {
        setMessages(p => [...p, {
          id: `b-${Date.now()}`,
          text: data.response,
          isUser: false,
          timestamp: data.timestamp,
          suggestions: data.suggestions,
          navLinks: data.navLinks,
          quickActions: data.quickActions,
        }]);
        setIsTyping(false);
        setTimeout(() => handleNavigate(data.navLinks[0].path), 800);
        return;
      }

      setMessages(p => [...p, {
        id: `b-${Date.now()}`,
        text: data.response,
        isUser: false,
        timestamp: data.timestamp,
        suggestions: data.suggestions,
        navLinks: data.navLinks,
        quickActions: data.quickActions,
      }]);
    } catch {
      setMessages(p => [...p, {
        id: `e-${Date.now()}`,
        text: 'Sorry, I encountered a connection error. Make sure the chatbot server is running on port 5001. 😔',
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: ['Try again', 'Help'],
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  const lastSuggestions = [...messages].reverse().find(m => !m.isUser && m.suggestions?.length)?.suggestions;

  return (
    <>
      {/* FAB */}
      <button onClick={toggleOpen} className={`cb-fab ${isOpen ? 'cb-fab-active' : ''}`} aria-label={isOpen ? 'Close chat' : 'Open chat'}>
        <div className="cb-fab-icon">
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        </div>
        {!isOpen && <span className="cb-pulse" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`cb-window ${isMinimized ? 'cb-minimized' : ''}`}>
          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-header-avatar">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="cb-header-title">LexBot</h3>
                <p className="cb-header-sub"><span className="cb-online-dot" /> Legal Assistant</p>
              </div>
            </div>
            <div className="cb-header-btns">
              <button onClick={() => setIsMinimized(!isMinimized)} className="cb-hbtn" aria-label="Minimize">
                <Minimize2 size={15} />
              </button>
              <button onClick={toggleOpen} className="cb-hbtn" aria-label="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="cb-messages" ref={containerRef} onScroll={handleScroll}>
                {messages.map(m => (
                  <Message key={m.id} msg={m} isUser={m.isUser} onNavigate={handleNavigate} />
                ))}
                {isTyping && (
                  <div className="cb-msg cb-msg-bot">
                    <div className="cb-avatar cb-avatar-bot"><Bot size={14} /></div>
                    <div className="cb-msg-content"><div className="cb-bubble cb-bubble-bot"><TypingDots /></div></div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {showScroll && (
                <button onClick={() => scrollDown()} className="cb-scroll-btn"><ChevronDown size={16} /></button>
              )}

              <Chips items={lastSuggestions} onSelect={s => sendMessage(s)} disabled={isTyping} />

              {/* Input */}
              <form onSubmit={handleSubmit} className="cb-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder='Try "Go to my cases" or ask a question...'
                  className="cb-input"
                  maxLength={1000}
                  disabled={isTyping}
                  autoComplete="off"
                />
                <button type="submit" disabled={!input.trim() || isTyping} className="cb-send" aria-label="Send">
                  <Send size={16} />
                </button>
              </form>

              <div className="cb-footer">
                <Navigation size={10} /> <span>Smart Navigation</span> <span>•</span> <span>⚖️ LegalConnect AI</span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
