import { useEffect, useState } from 'react';
import { caseService } from '../../services/caseService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useChat } from '../../hooks/useChat.js';
import Avatar from '../../components/ui/Avatar.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function Messages() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caseService.list({ limit: 20 }).then((d) => {
      const list = d.cases || [];
      setCases(list);
      if (list.length > 0) setSelectedCase(list[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl mb-6">Messages</h1>
      {loading ? <Skeleton className="h-96 rounded-xl" /> : cases.length === 0 ? (
        <div className="panel p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No case chats yet</p>
          <p className="text-sm text-ink-muted mt-1">Chats are available inside each case workspace.</p>
        </div>
      ) : (
        <div className="panel flex overflow-hidden" style={{ height: '70vh' }}>
          {/* Case sidebar */}
          <div className="w-64 border-r border-line overflow-y-auto shrink-0">
            {cases.map((c) => (
              <button key={c._id} onClick={() => setSelectedCase(c)}
                className={`w-full text-left p-4 border-b border-line hover:bg-paper transition-colors ${selectedCase?._id === c._id ? 'bg-chamber-50' : ''}`}>
                <p className="font-medium text-sm truncate">{c.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">{c.advocate?.name}</p>
              </button>
            ))}
          </div>
          {/* Chat area */}
          {selectedCase && <ChatPanel caseId={selectedCase._id} user={user} caseTitle={selectedCase.title} />}
        </div>
      )}
    </div>
  );
}

function ChatPanel({ caseId, user, caseTitle }) {
  const { messages, sendMessage, typingUsers } = useChat(caseId);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="border-b border-line px-5 py-3">
        <p className="font-semibold text-sm">{caseTitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-ink-muted text-sm">No messages yet. Start the conversation.</div>
        )}
        {messages.map((msg, i) => {
          const isMine = String(msg.sender?._id || msg.sender) === String(user._id);
          return (
            <div key={i} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
              <Avatar name={msg.sender?.name} size="xs" />
              <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${isMine ? 'bg-chamber-600 text-white rounded-tr-none' : 'bg-paper text-ink rounded-tl-none'}`}>
                {msg.content}
                <p className={`text-[10px] mt-0.5 ${isMine ? 'text-chamber-200' : 'text-ink-muted'}`}>
                  {format(new Date(msg.createdAt || Date.now()), 'h:mm a')}
                </p>
              </div>
            </div>
          );
        })}
        {typingUsers.length > 0 && (
          <div className="flex gap-1 items-center px-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-1.5 rounded-full bg-ink-muted animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-line p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="input-base flex-1" />
        <button type="submit" disabled={!input.trim()} className="rounded-lg bg-chamber-700 px-4 text-sm font-medium text-white hover:bg-chamber-800 disabled:opacity-50 transition-colors">Send</button>
      </form>
    </div>
  );
}
