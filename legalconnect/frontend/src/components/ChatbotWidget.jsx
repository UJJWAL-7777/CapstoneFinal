import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  Minimize2,
  ArrowRight,
  Navigation,
  Languages,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { generateChatResponse } from '../services/chatbotEngine.js';
import './chatbot.css';

const CHATBOT_API = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:5001/api/chat';

const WELCOME_MESSAGES = {
  en: {
    client: {
      text: "Hello! 👋 I'm **LexBot**, your multilingual LegalConnect assistant.\n\nI can help you navigate Indian laws, book verified advocates, and track your ongoing cases. Try asking in **English, हिन्दी, or Hinglish** — or click the mic 🎙️ to speak!",
      suggestions: ['🏛️ Landmark Cases', '📚 Which Section Applies?', "Stealing a friend's pen?", 'Cheque bounce advice'],
      quickActions: [
        { label: '🏛️ Landmark Cases', path: '/legal-resources' },
        { label: '🔍 Find Advocates', path: '/client/advocates' },
        { label: '📋 My Cases', path: '/client/cases' },
      ],
    },
    advocate: {
      text: "Hello! 👋 I'm **LexBot**, your practice assistant.\n\nI can help you manage consultations, track earnings, update availability, and review cases in English or हिन्दी.",
      suggestions: ['🏛️ Landmark Cases', 'View consultations', 'Check earnings', '📖 Legal Glossary'],
      quickActions: [
        { label: '🏛️ Landmark Cases', path: '/legal-resources' },
        { label: '📅 Consultations', path: '/advocate/consultations' },
        { label: '💰 Earnings', path: '/advocate/earnings' },
      ],
    },
    admin: {
      text: "Hello! 👋 I'm **LexBot**, your platform assistant.\n\nI can help you navigate verification queues, check platform analytics, and manage users.",
      suggestions: ['Platform overview', 'Pending verifications', 'View analytics', '🏛️ Landmark Cases'],
      quickActions: [
        { label: '📊 Dashboard', path: '/admin/dashboard' },
        { label: '✅ Verifications', path: '/admin/verification' },
        { label: '📈 Analytics', path: '/admin/analytics' },
      ],
    },
  },
  hi: {
    client: {
      text: "नमस्ते! 🙏 मैं **LexBot** हूँ, आपका LegalConnect कानूनी सहायक।\n\nमैं आपको भारतीय कानूनों (चेक बाउंस धारा 138, किरायेदार-मकान मालिक विवाद, ज़मानत, घरेलू हिंसा) को सरल भाषा में समझाने और वकील बुक करने में मदद करूँगा। आप माइक 🎙️ से बोल भी सकते हैं!",
      suggestions: ['🏛️ ऐतिहासिक केस', '📚 कौन सी धारा लगेगी?', 'चेक बाउंस सलाह', 'मकान मालिक विवाद'],
      quickActions: [
        { label: '🏛️ ऐतिहासिक केस', path: '/legal-resources' },
        { label: '🔍 वकील खोजें', path: '/client/advocates' },
        { label: '📋 मेरे केस', path: '/client/cases' },
      ],
    },
    advocate: {
      text: "नमस्ते! 🙏 मैं **LexBot** हूँ, आपका प्रैक्टिस सहायक।\n\nमैं आपको परामर्श शेड्यूल, मुकदमों की सूची और फीस रिकॉर्ड प्रबंधित करने में सहायता कर सकता हूँ।",
      suggestions: ['🏛️ ऐतिहासिक केस', 'परामर्श देखें', 'कमाई रिकॉर्ड', '📖 कानूनी शब्दकोश'],
      quickActions: [
        { label: '🏛️ ऐतिहासिक केस', path: '/legal-resources' },
        { label: '📅 परामर्श', path: '/advocate/consultations' },
        { label: '💰 कमाई', path: '/advocate/earnings' },
      ],
    },
    admin: {
      text: "नमस्ते एडमिन! 🙏 मैं **LexBot** हूँ, आपका एडमिन सहायक।\n\nवकील सत्यापन (Verification), एनालिटिक्स और प्लेटफॉर्म सेटिंग्स में सहायता के लिए मुझसे पूछें।",
      suggestions: ['डैशबोर्ड देखें', 'लंबित सत्यापन', 'एनालिटिक्स'],
      quickActions: [
        { label: '📊 डैशबोर्ड', path: '/admin/dashboard' },
        { label: '✅ सत्यापन', path: '/admin/verification' },
        { label: '📈 एनालिटिक्स', path: '/admin/analytics' },
      ],
    },
  },
  hinglish: {
    client: {
      text: "Namaste! 🙏 Main hoon **LexBot**, aapka legal assistant.\n\nAap mujhse Cheque bounce (Sec 138), tenant dispute, bail process ya FIR ke baare me pooch sakte hain aur direct advocate book kar sakte hain. Mic 🎙️ button daba kar bol bhi sakte hain!",
      suggestions: ['🏛️ Landmark Cases', '📚 Which section applies?', 'Cheque bounce advice', 'Tenant problem'],
      quickActions: [
        { label: '🏛️ Landmark Cases', path: '/legal-resources' },
        { label: '🔍 Find Advocates', path: '/client/advocates' },
        { label: '📋 My Cases', path: '/client/cases' },
      ],
    },
    advocate: {
      text: "Namaste Counsel! 🙏 Main **LexBot**, aapka legal practice assistant.\n\nAap upcoming appointments, client cases aur fees tracking ke baare me mujhse pooch sakte hain.",
      suggestions: ['View consultations', 'Check earnings', 'Update availability', '📖 Nyaya Kosh'],
      quickActions: [
        { label: '📅 Consultations', path: '/advocate/consultations' },
        { label: '💰 Earnings', path: '/advocate/earnings' },
        { label: '🕐 Availability', path: '/advocate/availability' },
      ],
    },
    admin: {
      text: "Namaste Admin! 🙏 Main **LexBot** platform assistant.\n\nPending verifications, active cases aur growth analytics check karne ke liye bataiye.",
      suggestions: ['Platform overview', 'Pending verifications', 'View analytics'],
      quickActions: [
        { label: '📊 Dashboard', path: '/admin/dashboard' },
        { label: '✅ Verifications', path: '/admin/verification' },
        { label: '📈 Analytics', path: '/admin/analytics' },
      ],
    },
  },
};

function cleanTextForSpeech(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/•/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[#_*~]/g, '')
    .trim();
}

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

function Message({ msg, isUser, onToggleSpeak, isSpeaking, lang }) {
  return (
    <div className={`cb-msg ${isUser ? 'cb-msg-user' : 'cb-msg-bot'}`}>
      <div className={`cb-avatar ${isUser ? 'cb-avatar-user' : 'cb-avatar-bot'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className="cb-msg-content">
        <div className={`cb-bubble ${isUser ? 'cb-bubble-user' : 'cb-bubble-bot'}`}>
          <div dangerouslySetInnerHTML={{ __html: md(msg.text) }} />
          <div className="cb-bubble-footer">
            <span className="cb-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && (
              <button
                type="button"
                className={`cb-speak-icon-btn ${isSpeaking ? 'cb-speaking' : ''}`}
                onClick={() => onToggleSpeak(msg)}
                title={isSpeaking ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'सुनिए' : 'Listen')}
                aria-label="Listen aloud"
              >
                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            )}
          </div>
        </div>
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
  const [selectedLang, setSelectedLang] = useState('en'); // 'en' | 'hi' | 'hinglish'
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const endRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [ready, setReady] = useState(false);

  if (!isAuthenticated || !user) return null;
  const role = user.role || 'client';

  const handleNavigate = useCallback((path) => {
    if (!path) return;
    navigate(path);
    setIsOpen(false);
    setIsMinimized(false);
  }, [navigate]);

  // Set initial welcome message
  useEffect(() => {
    if (isOpen && !ready) {
      const w = WELCOME_MESSAGES[selectedLang]?.[role] || WELCOME_MESSAGES.en.client;
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
  }, [isOpen, ready, role, selectedLang]);

  // Handle switching language
  const handleLanguageChange = (langKey) => {
    setSelectedLang(langKey);
    const w = WELCOME_MESSAGES[langKey]?.[role] || WELCOME_MESSAGES.en.client;
    setMessages(prev => [
      ...prev,
      {
        id: `lang-switch-${Date.now()}`,
        text: langKey === 'hi'
          ? '🇮🇳 भाषा बदलकर **हिन्दी** कर दी गई है। अब आप देवनागरी में पूछ सकते हैं या बोल सकते हैं!'
          : langKey === 'hinglish'
          ? '🗣️ Language changed to **Hinglish**. Aap conversational Hindi-English me queries pooch sakte hain!'
          : '🌐 Language switched to **English**. Ask any legal questions or navigate the platform!',
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: w.suggestions,
        quickActions: w.quickActions,
        navLinks: [],
      }
    ]);
  };

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

  // ─── Text-to-Speech (Suniye) ──────────────────────────────────
  const toggleSpeak = (msg) => {
    if (!window.speechSynthesis) return;

    if (speakingMessageId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = cleanTextForSpeech(msg.text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'hinglish' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  // ─── Speech-to-Text (Voice Input) ─────────────────────────────
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'hinglish' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    // Stop speaking if new message is sent
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);

    setMessages(p => [...p, {
      id: `u-${Date.now()}`,
      text: msg,
      isUser: true,
      timestamp: new Date().toISOString(),
    }]);
    setInput('');
    setIsTyping(true);

    try {
      let data = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(CHATBOT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            userRole: role,
            userName: user.name,
            lang: selectedLang,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && json.data.intent !== 'unknown') {
            data = json.data;
          }
        }
      } catch {
        // Fallback gracefully to client-side engine
      }

      // If remote API is offline, timed out, or returned unknown intent, execute client-side intelligence
      if (!data) {
        data = generateChatResponse(msg, role, user.name, selectedLang);
      }

      await new Promise(r => setTimeout(r, 150 + Math.random() * 200));

      // Auto-navigate if exactly 1 nav link and intent is navigation
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
      // In extreme event of any error, still provide fallback answer
      const fallback = generateChatResponse(msg, role, user.name, selectedLang);
      setMessages(p => [...p, {
        id: `b-${Date.now()}`,
        text: fallback.response,
        isUser: false,
        timestamp: fallback.timestamp,
        suggestions: fallback.suggestions,
        navLinks: fallback.navLinks,
        quickActions: fallback.quickActions,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const toggleOpen = () => {
    if (isOpen) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      setSpeakingMessageId(null);
      setIsListening(false);
    }
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const lastSuggestions = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].isUser && messages[i].suggestions?.length) {
        return messages[i].suggestions;
      }
    }
    return null;
  }, [messages]);

  return (
    <>
      {/* Floating Action Button */}
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
                <h3 className="cb-header-title">LexBot AI</h3>
                <p className="cb-header-sub">
                  <span className="cb-online-dot" /> Nyaya Bhasha • Multilingual
                </p>
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
              {/* Vernacular Language Switcher Bar */}
              <div className="cb-lang-bar">
                <Languages size={13} className="cb-lang-icon" />
                <button
                  type="button"
                  className={`cb-lang-btn ${selectedLang === 'en' ? 'cb-lang-active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  🌐 English
                </button>
                <button
                  type="button"
                  className={`cb-lang-btn ${selectedLang === 'hi' ? 'cb-lang-active' : ''}`}
                  onClick={() => handleLanguageChange('hi')}
                >
                  🇮🇳 हिन्दी
                </button>
                <button
                  type="button"
                  className={`cb-lang-btn ${selectedLang === 'hinglish' ? 'cb-lang-active' : ''}`}
                  onClick={() => handleLanguageChange('hinglish')}
                >
                  🗣️ Hinglish
                </button>
              </div>

              {/* Messages Container */}
              <div className="cb-messages" ref={containerRef} onScroll={handleScroll}>
                {messages.map(m => (
                  <Message
                    key={m.id}
                    msg={m}
                    isUser={m.isUser}
                    onToggleSpeak={toggleSpeak}
                    isSpeaking={speakingMessageId === m.id}
                    lang={selectedLang}
                  />
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

              {/* Chips / Quick Suggestions (Only show on initial welcome state for clean UI) */}
              {messages.length <= 1 && (
                <Chips items={lastSuggestions} onSelect={s => sendMessage(s)} disabled={isTyping} />
              )}

              {/* Speech Recognition Active Indicator */}
              {isListening && (
                <div className="cb-listening-toast">
                  <span>🎙️ {selectedLang === 'hi' ? 'सुन रहे हैं... कृपया बोलें' : 'Listening... speak your question'}</span>
                  <button type="button" onClick={toggleVoiceInput} className="text-xs underline font-bold">Stop</button>
                </div>
              )}

              {/* Input Form with Voice Button */}
              <form onSubmit={handleSubmit} className="cb-input-area">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`cb-mic-btn ${isListening ? 'cb-mic-active' : ''}`}
                  title={isListening ? 'Stop listening' : 'Voice input (Speak)'}
                  aria-label="Voice input"
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={
                    selectedLang === 'hi'
                      ? 'पूछें: "चेक बाउंस नियम" या "वकील कैसे खोजें"...'
                      : selectedLang === 'hinglish'
                      ? 'Poochhein: "Makan malik dispute" ya "Bail process"...'
                      : 'Ask in English, हिन्दी, or click mic to speak...'
                  }
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
                <Navigation size={10} /> <span>Nyaya Bhasha AI</span> <span>•</span> <span>🎙️ Voice & Vernacular Legal Support</span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
