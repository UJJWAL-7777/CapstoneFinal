// Advocate CaseWorkspace - same tabs as client but with extra advocate-only features
// (tasks creation, document review, notes, timeline events, hearing management)
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Scale, FileText, CheckSquare, Clock, Gavel, MessageSquare, StickyNote,
  Plus, Trash2, CheckCircle, Download, Eye
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
import Modal from '../../components/ui/Modal.jsx';
import { format } from 'date-fns';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Scale },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'hearings', label: 'Hearings', icon: Gavel },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
];

const CASE_STATUSES = ['Opened', 'In Progress', 'Hearing', 'Resolved', 'Closed'];
const STATUS_COLORS = { Opened: 'primary', 'In Progress': 'info', Hearing: 'warning', Resolved: 'success', Closed: 'default' };
const PRIORITY_COLORS = { low: 'default', medium: 'warning', high: 'danger' };

export default function AdvocateCaseWorkspace() {
  const { id: caseId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [hearingForm, setHearingForm] = useState({ date: '', time: '10:00', court: '', purpose: '', notes: '' });
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);

  const { messages, sendMessage } = useChat(caseId);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      caseService.get(caseId),
      caseService.getDocuments(caseId),
      caseService.getTasks(caseId),
      caseService.getTimeline(caseId),
      caseService.getHearings(caseId),
      caseService.getNotes(caseId),
    ]).then(([c, docs, t, tl, h, n]) => {
      setCaseData(c); setDocuments(docs); setTasks(t); setTimeline(tl); setHearings(h); setNotes(n);
    }).catch(() => toast.error('Failed to load case')).finally(() => setLoading(false));
  }, [caseId]);

  const updateStatus = async (status) => {
    try {
      const updated = await caseService.update(caseId, { status });
      setCaseData(updated);
      toast.success(`Case status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const createTask = async () => {
    setSaving(true);
    try {
      const task = await caseService.createTask(caseId, { ...taskForm, assignedTo: caseData.client._id });
      setTasks((p) => [...p, task]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium' });
      toast.success('Task created');
    } catch { toast.error('Failed to create task'); }
    finally { setSaving(false); }
  };

  const createHearing = async () => {
    setSaving(true);
    try {
      const h = await caseService.createHearing(caseId, hearingForm);
      setHearings((p) => [...p, h]);
      setShowHearingModal(false);
      setHearingForm({ date: '', time: '10:00', court: '', purpose: '', notes: '' });
      toast.success('Hearing scheduled');
    } catch { toast.error('Failed to schedule hearing'); }
    finally { setSaving(false); }
  };

  const createNote = async () => {
    if (!noteContent.trim()) return;
    setSaving(true);
    try {
      const n = await caseService.createNote(caseId, { content: noteContent });
      setNotes((p) => [n, ...p]);
      setShowNoteModal(false);
      setNoteContent('');
      toast.success('Note saved');
    } catch { toast.error('Failed to save note'); }
    finally { setSaving(false); }
  };

  const reviewDoc = async (docId) => {
    try {
      const updated = await caseService.reviewDocument(caseId, docId);
      setDocuments((p) => p.map((d) => d._id === docId ? updated : d));
      toast.success('Document marked as reviewed');
    } catch { toast.error('Failed to review document'); }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput('');
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  if (!caseData) return <div className="panel p-12 text-center text-ink-muted">Case not found.</div>;

  const tabsWithCount = TABS.map((t) => ({
    ...t,
    count: t.id === 'tasks' ? tasks.length : t.id === 'documents' ? documents.length : t.id === 'hearings' ? hearings.length : t.id === 'notes' ? notes.length : undefined,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
            <div className="flex items-center gap-3 mt-2">
              <Avatar name={caseData.client?.name} size="xs" />
              <span className="text-sm text-ink-muted">{caseData.client?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={caseData.status} onChange={(e) => updateStatus(e.target.value)} className="input-base w-auto">
              {CASE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <Tabs tabs={tabsWithCount} activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="panel p-4 text-center"><p className="text-2xl font-bold">{tasks.filter((t) => t.status !== 'completed').length}</p><p className="text-sm text-ink-muted">Open tasks</p></div>
          <div className="panel p-4 text-center"><p className="text-2xl font-bold">{documents.length}</p><p className="text-sm text-ink-muted">Documents</p></div>
          <div className="panel p-4 text-center"><p className="text-2xl font-bold">{hearings.filter((h) => new Date(h.date) >= new Date()).length}</p><p className="text-sm text-ink-muted">Upcoming hearings</p></div>
          <div className="panel p-4 text-center"><p className="text-2xl font-bold">{notes.length}</p><p className="text-sm text-ink-muted">Private notes</p></div>
        </div>
      )}

      {/* Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowTaskModal(true)}><Plus className="h-4 w-4" /> Assign Task</Button>
          </div>
          {tasks.length === 0 ? <div className="panel p-10 text-center text-ink-muted">No tasks yet</div> : (
            <div className="panel divide-y divide-line">
              {tasks.map((task) => (
                <div key={task._id} className="flex items-start gap-3 p-4">
                  <CheckCircle className={`h-5 w-5 mt-0.5 ${task.status === 'completed' ? 'text-emerald-500' : 'text-ink-muted'}`} />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-ink-muted' : ''}`}>{task.title}</p>
                    {task.description && <p className="text-xs text-ink-muted mt-0.5">{task.description}</p>}
                    <div className="flex gap-2 mt-1">
                      <Badge variant={PRIORITY_COLORS[task.priority]} size="xs">{task.priority}</Badge>
                      {task.dueDate && <span className="text-xs text-ink-muted">Due {format(new Date(task.dueDate), 'MMM d')}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          {documents.length === 0 ? <div className="panel p-10 text-center text-ink-muted">No documents uploaded</div> : (
            <div className="panel divide-y divide-line">
              {documents.map((doc) => (
                <div key={doc._id} className="flex items-center gap-3 p-4">
                  <FileText className="h-5 w-5 text-chamber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-ink-muted">{doc.category} · {(doc.size / 1024).toFixed(0)} KB · Uploaded by {doc.uploadedBy?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.isReviewed ? <Badge variant="success" size="xs">Reviewed</Badge> : (
                      <button onClick={() => reviewDoc(doc._id)} className="text-xs text-chamber-600 hover:underline flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Review</button>
                    )}
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-chamber-600 hover:text-chamber-800"><Download className="h-4 w-4" /></a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hearings */}
      {activeTab === 'hearings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowHearingModal(true)}><Plus className="h-4 w-4" /> Schedule Hearing</Button>
          </div>
          {hearings.length === 0 ? <div className="panel p-10 text-center text-ink-muted">No hearings scheduled</div> : (
            hearings.map((h) => (
              <div key={h._id} className="panel p-5">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{h.purpose}</p>
                    <p className="text-sm text-ink-muted">{h.court}</p>
                    <p className="text-sm mt-1">{format(new Date(h.date), 'EEEE, MMM d, yyyy')} at {h.time}</p>
                  </div>
                  <Badge variant={new Date(h.date) < new Date() ? 'default' : 'success'}>{new Date(h.date) < new Date() ? 'Past' : 'Upcoming'}</Badge>
                </div>
                {h.notes && <p className="mt-2 text-sm text-ink-soft border-t border-line pt-2">{h.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Timeline */}
      {activeTab === 'timeline' && (
        <div className="relative ml-4 pl-6 border-l-2 border-line space-y-6">
          {timeline.length === 0 ? <div className="panel p-10 text-center text-ink-muted">No events yet</div> : (
            timeline.map((event) => (
              <div key={event._id} className="relative">
                <div className="timeline-dot bg-chamber-600 ring-chamber-200" />
                <div className="panel p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{event.title}</p>
                      {event.description && <p className="text-sm text-ink-soft mt-0.5">{event.description}</p>}
                    </div>
                    <p className="text-xs text-ink-muted shrink-0 ml-3">{format(new Date(event.eventDate || event.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowNoteModal(true)}><Plus className="h-4 w-4" /> Add Note</Button>
          </div>
          {notes.length === 0 ? <div className="panel p-10 text-center text-ink-muted">No private notes yet</div> : (
            notes.map((note) => (
              <div key={note._id} className="panel p-5">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-ink leading-relaxed flex-1">{note.content}</p>
                  {note.isPinned && <Badge variant="brass" size="xs" className="ml-2 shrink-0">Pinned</Badge>}
                </div>
                <p className="text-xs text-ink-muted mt-2">{format(new Date(note.createdAt), 'MMM d, yyyy, h:mm a')}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Chat */}
      {activeTab === 'chat' && (
        <div className="panel flex flex-col" style={{ height: '60vh' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.length === 0 && <div className="flex items-center justify-center h-full text-ink-muted text-sm">Start the conversation</div>}
            {messages.map((msg, i) => {
              const isMine = String(msg.sender?._id || msg.sender) === String(user._id);
              return (
                <div key={i} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <Avatar name={msg.sender?.name} size="xs" />
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMine ? 'bg-chamber-600 text-white rounded-tr-none' : 'bg-paper text-ink rounded-tl-none'}`}>
                    {msg.content}
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-chamber-200' : 'text-ink-muted'}`}>{format(new Date(msg.createdAt || Date.now()), 'h:mm a')}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-2 border-t border-line p-3">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="input-base flex-1" />
            <Button type="submit" size="sm" disabled={!chatInput.trim()}>Send</Button>
          </form>
        </div>
      )}

      {/* Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Assign Task"
        footer={<><Button variant="secondary" onClick={() => setShowTaskModal(false)}>Cancel</Button><Button onClick={createTask} loading={saving}>Create Task</Button></>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Title *</label><input value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} className="input-base" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea rows={2} value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} className="input-base resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Due Date</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))} className="input-base" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))} className="input-base">
                {['low', 'medium', 'high'].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Hearing Modal */}
      <Modal isOpen={showHearingModal} onClose={() => setShowHearingModal(false)} title="Schedule Hearing"
        footer={<><Button variant="secondary" onClick={() => setShowHearingModal(false)}>Cancel</Button><Button onClick={createHearing} loading={saving}>Schedule</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Date *</label><input type="date" value={hearingForm.date} onChange={(e) => setHearingForm((p) => ({ ...p, date: e.target.value }))} className="input-base" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Time</label><input type="time" value={hearingForm.time} onChange={(e) => setHearingForm((p) => ({ ...p, time: e.target.value }))} className="input-base" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Court / Location *</label><input value={hearingForm.court} onChange={(e) => setHearingForm((p) => ({ ...p, court: e.target.value }))} className="input-base" placeholder="e.g. Delhi High Court" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Purpose</label><input value={hearingForm.purpose} onChange={(e) => setHearingForm((p) => ({ ...p, purpose: e.target.value }))} className="input-base" placeholder="e.g. Evidence submission" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Notes</label><textarea rows={2} value={hearingForm.notes} onChange={(e) => setHearingForm((p) => ({ ...p, notes: e.target.value }))} className="input-base resize-none" /></div>
        </div>
      </Modal>

      {/* Note Modal */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Private Note"
        footer={<><Button variant="secondary" onClick={() => setShowNoteModal(false)}>Cancel</Button><Button onClick={createNote} loading={saving}>Save Note</Button></>}>
        <textarea rows={5} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write your private notes here (only visible to you)..." className="input-base resize-none w-full" />
      </Modal>
    </div>
  );
}
