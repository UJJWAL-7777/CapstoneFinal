import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Scale, FileText, CheckSquare, Clock, Gavel, MessageSquare, StickyNote,
  Upload, Plus, Download, Trash2, CheckCircle
} from 'lucide-react';
import { caseService } from '../../services/caseService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useChat } from '../../hooks/useChat.js';
import { useToast } from '../../context/ToastContext.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import FileDropzone from '../../components/ui/FileDropzone.jsx';
import Modal from '../../components/ui/Modal.jsx';
import RatingStars from '../../components/ui/RatingStars.jsx';
import { reviewService } from '../../services/reviewService.js';
import { format } from 'date-fns';
import { ROLES } from '../../utils/constants.js';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Scale },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'hearings', label: 'Hearings', icon: Gavel },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
];

const STATUS_COLORS = { Opened: 'primary', 'In Progress': 'info', Hearing: 'warning', Resolved: 'success', Closed: 'default' };
const PRIORITY_COLORS = { low: 'default', medium: 'warning', high: 'danger' };
const TASK_STATUS_COLORS = { pending: 'warning', 'in-progress': 'info', completed: 'success', cancelled: 'danger' };

export default function CaseWorkspace() {
  const { id: caseId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { messages, sendMessage, typingUsers } = useChat(caseId);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      caseService.get(caseId),
      caseService.getDocuments(caseId),
      caseService.getTasks(caseId),
      caseService.getTimeline(caseId),
      caseService.getHearings(caseId),
    ]).then(([c, docs, tasks, tl, hr]) => {
      setCaseData(c);
      setDocuments(docs);
      setTasks(tasks);
      setTimeline(tl);
      setHearings(hr);
    }).catch(() => toast.error('Failed to load case'))
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('name', uploadName || uploadFile.name);
      const doc = await caseService.uploadDocument(caseId, fd);
      setDocuments((prev) => [doc, ...prev]);
      setShowUpload(false);
      setUploadFile(null);
      setUploadName('');
      toast.success('Document uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleTaskStatus = async (taskId, newStatus) => {
    try {
      const updated = await caseService.updateTask(caseId, taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => t._id === taskId ? updated : t));
      toast.success('Task updated');
    } catch { toast.error('Failed to update task'); }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleReview = async () => {
    if (!caseData?.consultation) { toast.error('No consultation linked'); return; }
    setSubmittingReview(true);
    try {
      await reviewService.create({ consultationId: caseData.consultation._id || caseData.consultation, ...reviewForm });
      toast.success('Review submitted!');
      setShowReview(false);
    } catch (e) { toast.error(e.response?.data?.error?.message || 'Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!caseData) return <div className="panel p-12 text-center text-ink-muted">Case not found.</div>;

  const tabsWithCount = TABS.map((t) => ({
    ...t,
    count: t.id === 'documents' ? documents.length : t.id === 'tasks' ? tasks.length : t.id === 'timeline' ? timeline.length : t.id === 'hearings' ? hearings.length : undefined,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Case header */}
      <div className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Scale className="h-7 w-7 text-chamber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{caseData.title}</h1>
              <Badge variant={STATUS_COLORS[caseData.status]}>{caseData.status}</Badge>
              <Badge variant={PRIORITY_COLORS[caseData.priority]}>{caseData.priority} priority</Badge>
            </div>
            <p className="text-sm text-ink-muted mt-1">#{caseData.caseId} · {caseData.practiceArea}</p>
            {caseData.description && <p className="mt-2 text-sm text-ink-soft">{caseData.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            {caseData.status === 'Resolved' && user.role === ROLES.CLIENT && (
              <Button size="sm" variant="brass" onClick={() => setShowReview(true)}>Leave Review</Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Avatar name={caseData.advocate?.name} src={caseData.advocate?.avatar?.url} size="sm" />
            <div>
              <p className="text-xs text-ink-muted">Advocate</p>
              <p className="font-medium">{caseData.advocate?.name}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Opened</p>
            <p className="font-medium">{format(new Date(caseData.createdAt), 'MMM d, yyyy')}</p>
          </div>
          {caseData.courtName && (
            <div>
              <p className="text-xs text-ink-muted">Court</p>
              <p className="font-medium">{caseData.courtName}</p>
            </div>
          )}
        </div>
      </div>

      <Tabs tabs={tabsWithCount} activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="panel p-4 text-center"><p className="text-2xl font-bold">{tasks.filter((t) => t.status !== 'completed').length}</p><p className="text-sm text-ink-muted">Pending tasks</p></div>
          <div className="panel p-4 text-center"><p className="text-2xl font-bold">{documents.length}</p><p className="text-sm text-ink-muted">Documents</p></div>
          <div className="panel p-4 text-center"><p className="text-2xl font-bold">{hearings.filter((h) => new Date(h.date) >= new Date()).length}</p><p className="text-sm text-ink-muted">Upcoming hearings</p></div>
        </div>
      )}

      {/* Documents tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {user.role === ROLES.CLIENT && (
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowUpload(true)}><Upload className="h-4 w-4" />Upload Document</Button>
            </div>
          )}
          {documents.length === 0 ? (
            <div className="panel p-10 text-center"><FileText className="mx-auto h-10 w-10 text-ink-muted mb-3" /><p className="text-ink-muted">No documents yet</p></div>
          ) : (
            <div className="panel divide-y divide-line">
              {documents.map((doc) => (
                <div key={doc._id} className="flex items-center gap-3 p-4">
                  <FileText className="h-5 w-5 text-chamber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-ink-muted">{doc.category} · {(doc.size / 1024).toFixed(0)} KB · {format(new Date(doc.createdAt), 'MMM d')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.isReviewed && <Badge variant="success" size="xs">Reviewed</Badge>}
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-chamber-600 hover:text-chamber-800"><Download className="h-4 w-4" /></a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="panel p-10 text-center"><CheckSquare className="mx-auto h-10 w-10 text-ink-muted mb-3" /><p className="text-ink-muted">No tasks assigned</p></div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="panel p-4 flex items-start gap-3">
                <CheckCircle className={`h-5 w-5 mt-0.5 ${task.status === 'completed' ? 'text-emerald-500' : 'text-ink-muted'}`} />
                <div className="flex-1">
                  <p className={`font-medium ${task.status === 'completed' ? 'line-through text-ink-muted' : 'text-ink'}`}>{task.title}</p>
                  {task.description && <p className="text-sm text-ink-muted mt-0.5">{task.description}</p>}
                  <div className="flex gap-2 mt-1">
                    <Badge variant={PRIORITY_COLORS[task.priority]} size="xs">{task.priority}</Badge>
                    <Badge variant={TASK_STATUS_COLORS[task.status]} size="xs">{task.status}</Badge>
                    {task.dueDate && <span className="text-xs text-ink-muted">Due {format(new Date(task.dueDate), 'MMM d')}</span>}
                  </div>
                </div>
                {task.status !== 'completed' && String(task.assignedTo?._id) === String(user._id) && (
                  <button onClick={() => handleTaskStatus(task._id, 'completed')} className="text-xs text-emerald-600 hover:underline whitespace-nowrap">Mark done</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Timeline tab */}
      {activeTab === 'timeline' && (
        <div className="relative ml-4 pl-6 border-l-2 border-line space-y-6">
          {timeline.length === 0 ? (
            <div className="panel p-10 text-center"><Clock className="mx-auto h-10 w-10 text-ink-muted mb-3" /><p className="text-ink-muted">No events yet</p></div>
          ) : timeline.map((event) => (
            <div key={event._id} className="relative">
              <div className="timeline-dot bg-chamber-600 ring-chamber-200" />
              <div className="panel p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{event.title}</p>
                    {event.description && <p className="text-sm text-ink-soft mt-0.5">{event.description}</p>}
                  </div>
                  <p className="text-xs text-ink-muted shrink-0 ml-3">{format(new Date(event.eventDate || event.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hearings tab */}
      {activeTab === 'hearings' && (
        <div className="space-y-4">
          {hearings.length === 0 ? (
            <div className="panel p-10 text-center"><Gavel className="mx-auto h-10 w-10 text-ink-muted mb-3" /><p className="text-ink-muted">No hearings scheduled</p></div>
          ) : hearings.map((h) => (
            <div key={h._id} className="panel p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{h.purpose}</p>
                  <p className="text-sm text-ink-muted">{h.court}</p>
                  <p className="text-sm mt-1">{format(new Date(h.date), 'EEEE, MMM d, yyyy')} at {h.time}</p>
                </div>
                <Badge variant={new Date(h.date) < new Date() ? 'default' : 'success'}>{new Date(h.date) < new Date() ? 'Past' : 'Upcoming'}</Badge>
              </div>
              {h.notes && <p className="mt-2 text-sm text-ink-soft border-t border-line pt-2">{h.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Chat tab */}
      {activeTab === 'chat' && (
        <div className="panel flex flex-col" style={{ height: '60vh' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-ink-muted text-sm">Start the conversation</div>
            )}
            {messages.map((msg, i) => {
              const isMine = String(msg.sender?._id || msg.sender) === String(user._id);
              return (
                <div key={i} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <Avatar name={msg.sender?.name} size="sm" />
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMine ? 'bg-chamber-600 text-white rounded-tr-sm' : 'bg-paper text-ink rounded-tl-sm'}`}>
                    {msg.content}
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-chamber-200' : 'text-ink-muted'}`}>{format(new Date(msg.createdAt || Date.now()), 'h:mm a')}</p>
                  </div>
                </div>
              );
            })}
            {typingUsers.length > 0 && (
              <div className="flex gap-2">
                <div className="flex gap-1 items-center bg-paper rounded-2xl px-4 py-2">
                  {[0, 1, 2].map((i) => <div key={i} className="h-1.5 w-1.5 rounded-full bg-ink-muted animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-2 border-t border-line p-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="input-base flex-1"
            />
            <Button type="submit" size="sm" disabled={!chatInput.trim()}>Send</Button>
          </form>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document"
        footer={<><Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button><Button onClick={handleUpload} loading={uploading} disabled={!uploadFile}>Upload</Button></>}>
        <div className="space-y-4">
          <FileDropzone onFile={setUploadFile} />
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Document Name (optional)</label>
            <input type="text" value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="e.g. Property deed" className="input-base" />
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={showReview} onClose={() => setShowReview(false)} title="Leave a Review"
        footer={<><Button variant="secondary" onClick={() => setShowReview(false)}>Cancel</Button><Button onClick={handleReview} loading={submittingReview}>Submit Review</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Overall Rating</label>
            <RatingStars rating={reviewForm.rating} size="lg" onChange={(r) => setReviewForm((p) => ({ ...p, rating: r }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Comment</label>
            <textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} placeholder="Describe your experience..." className="input-base resize-none" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
