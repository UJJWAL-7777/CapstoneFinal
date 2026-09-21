import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useChat } from '../../hooks/useChat.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { MessageSquare, ExternalLink, Send, Search, Users, PlusCircle, Scale, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const queryCaseId = searchParams.get('caseId');
  const queryConsId = searchParams.get('consultationId');
  const queryClientId = searchParams.get('clientId');

  useEffect(() => {
    setLoading(true);
    api
      .get('/messages/conversations')
      .then((res) => {
        const list = res.data?.data || [];
        setThreads(list);

        // Auto-select based on query params or default to first thread
        if (list.length > 0) {
          let target = null;
          if (queryCaseId) {
            target = list.find((t) => t.caseId === queryCaseId);
          } else if (queryConsId) {
            target = list.find((t) => t.consultationId === queryConsId);
          } else if (queryClientId) {
            target = list.find(
              (t) => String(t.client?._id || t.client) === String(queryClientId)
            );
          }
          setSelectedThread(target || list[0]);
        }
      })
      .catch((err) => {
        console.warn('Conversations fetch notice, falling back:', err.message);
      })
      .finally(() => setLoading(false));
  }, [queryCaseId, queryConsId, queryClientId]);

  const filteredThreads = threads.filter((t) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    const other = user?.role === 'advocate' ? t.client : t.advocate;
    return (
      t.title?.toLowerCase().includes(s) ||
      other?.name?.toLowerCase().includes(s) ||
      t.caseNumber?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="animate-fade-in space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Messages</h1>
          <p className="text-ink-soft text-sm mt-0.5">Secure, real-time encrypted communication with legal counterparties</p>
        </div>
        {user?.role === 'advocate' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/advocate/cases')}
            className="gap-1.5 self-start sm:self-auto text-xs"
          >
            <PlusCircle className="h-4 w-4" /> Open New Matter
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-[72vh] rounded-2xl" />
      ) : threads.length === 0 ? (
        <div className="panel p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="h-16 w-16 bg-chamber-50 border border-chamber-100 rounded-2xl flex items-center justify-center mx-auto text-chamber-700">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">No active conversations yet</h3>
            <p className="text-sm text-ink-muted mt-1 leading-relaxed">
              {user?.role === 'advocate'
                ? 'Conversations are automatically opened for your active client cases and consultations. You can also start a new case matter with any client.'
                : 'Conversations are active once you book a consultation or an advocate opens a case workspace for you.'}
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            {user?.role === 'advocate' ? (
              <>
                <Button size="sm" onClick={() => navigate('/advocate/cases')} className="gap-1.5 shadow-sm">
                  <Scale className="h-4 w-4" /> View Cases
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate('/advocate/clients')} className="gap-1.5">
                  <Users className="h-4 w-4" /> Client Directory
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate('/client/advocates')} className="gap-1.5 shadow-sm">
                Find Advocates
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="panel flex flex-col md:flex-row overflow-hidden shadow-sm border border-line rounded-2xl" style={{ height: '74vh' }}>
          {/* Thread Sidebar */}
          <div className="w-full md:w-80 border-r border-line flex flex-col shrink-0 bg-paper/20">
            <div className="p-3.5 border-b border-line bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="input-base pl-8 py-1.5 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-line scrollbar-thin">
              {filteredThreads.map((t) => {
                const other = user?.role === 'advocate' ? t.client : t.advocate;
                const isSelected = selectedThread?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThread(t)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-chamber-50/90 border-l-4 border-l-chamber-600 shadow-inner'
                        : 'hover:bg-paper/60'
                    }`}
                  >
                    <Avatar name={other?.name} src={other?.avatar?.url} size="md" className="shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-chamber-900' : 'text-ink'}`}>
                          {other?.name || 'Contact'}
                        </p>
                        {t.lastMessage?.createdAt && (
                          <span className="text-[10px] text-ink-muted shrink-0">
                            {format(new Date(t.lastMessage.createdAt), 'h:mm a')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted font-medium truncate mt-0.5 flex items-center gap-1">
                        {t.type === 'case' ? (
                          <span className="text-chamber-700 bg-chamber-100/60 px-1 rounded text-[9px] font-semibold">CASE</span>
                        ) : (
                          <span className="text-blue-700 bg-blue-100/60 px-1 rounded text-[9px] font-semibold">MEET</span>
                        )}
                        <span className="truncate">{t.title}</span>
                      </p>
                      {t.lastMessage?.content && (
                        <p className="text-[11px] text-ink-soft truncate mt-1">
                          {t.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Panel */}
          {selectedThread ? (
            <ChatPanel
              thread={selectedThread}
              user={user}
              otherParty={user?.role === 'advocate' ? selectedThread.client : selectedThread.advocate}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-ink-muted">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChatPanel({ thread, user, otherParty }) {
  const target = thread.type === 'case' ? { caseId: thread.caseId } : { consultationId: thread.consultationId };
  const { messages, connected, loading, sendMessage, typingUsers } = useChat(target);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  const caseWorkspaceLink =
    thread.type === 'case'
      ? `/${user?.role === 'advocate' ? 'advocate' : 'client'}/cases/${thread.caseId}`
      : null;

  return (
    <div className="flex flex-1 flex-col min-w-0 bg-white">
      {/* Thread Header */}
      <div className="border-b border-line px-5 py-3.5 flex items-center justify-between bg-paper/20">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={otherParty?.name} src={otherParty?.avatar?.url} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-ink truncate">{otherParty?.name || 'Contact'}</p>
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                {connected ? 'Live' : 'Connecting'}
              </span>
            </div>
            <p className="text-[11px] text-ink-muted truncate mt-0.5">
              {thread.title} {thread.caseNumber ? `• ${thread.caseNumber}` : ''}
            </p>
          </div>
        </div>

        {caseWorkspaceLink && (
          <Link
            to={caseWorkspaceLink}
            className="text-xs text-chamber-700 hover:text-chamber-900 bg-white border border-line rounded-lg px-2.5 py-1.5 flex items-center gap-1 font-medium shadow-2xs shrink-0 ml-2"
          >
            Case Workspace <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3.5 scrollbar-thin bg-paper/10">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-chamber-200 border-t-chamber-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
            <MessageSquare className="h-8 w-8 text-ink-muted opacity-40" />
            <p className="text-sm font-semibold text-ink">No messages in this matter yet</p>
            <p className="text-xs text-ink-muted max-w-xs leading-relaxed">
              Send a message to coordinate on case documents, hearing dates, evidence, and strategy.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = String(msg.sender?._id || msg.sender) === String(user?._id);
            return (
              <div key={msg._id || i} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar name={msg.sender?.name} src={msg.sender?.avatar?.url} size="xs" className="mt-1" />
                <div
                  className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                    isMine
                      ? 'bg-chamber-600 text-white rounded-tr-none'
                      : 'bg-white border border-line text-ink rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-chamber-200 text-right' : 'text-ink-muted'}`}>
                    {format(new Date(msg.createdAt || Date.now()), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {typingUsers.length > 0 && (
          <div className="flex gap-1.5 items-center px-3 py-1">
            <span className="text-[11px] text-ink-muted mr-1">Typing</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-ink-muted animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-line p-3 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a secure message..."
          className="input-base flex-1 text-sm rounded-xl py-2 px-3.5"
        />
        <Button
          type="submit"
          disabled={!input.trim()}
          size="sm"
          className="gap-1.5 px-4 shadow-sm"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </Button>
      </form>
    </div>
  );
}
