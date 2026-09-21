// Advocate CaseWorkspace - complete advocate workspace with tasks, hearings, notes, timeline, document uploads, document requests, and in-website preview
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Scale, FileText, CheckSquare, Clock, Gavel, MessageSquare, StickyNote,
  Plus, Trash2, CheckCircle, Download, Eye, Upload, Send, Inbox, Image as ImageIcon
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
import FileDropzone from '../../components/ui/FileDropzone.jsx';
import DocumentPreviewModal from '../../components/ui/DocumentPreviewModal.jsx';
import { getFileUrl, downloadFile, formatFileSize } from '../../utils/file.js';
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
const PRIORITY_COLORS = { low: 'default', medium: 'warning', high: 'danger', urgent: 'danger' };

const DOCUMENT_CATEGORIES = [
  { value: 'Agreement', label: 'Agreement / Contract' },
  { value: 'Identity', label: 'Identity Proof' },
  { value: 'Court', label: 'Court Order' },
  { value: 'Evidence', label: 'Evidence' },
  { value: 'Legal', label: 'Legal Notice / Property Deed' },
  { value: 'Financial', label: 'Financial Statement' },
  { value: 'Correspondence', label: 'Correspondence' },
  { value: 'Other', label: 'Other' },
];

export default function AdvocateCaseWorkspace() {
  const { id: caseId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Legal');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Request document modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    category: 'Evidence',
    dueDate: '',
  });
  const [requesting, setRequesting] = useState(false);

  // Forms
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
      caseService.getDocumentRequests(caseId).catch(() => []),
      caseService.getTasks(caseId),
      caseService.getTimeline(caseId),
      caseService.getHearings(caseId),
      caseService.getNotes(caseId),
    ]).then(([c, docs, requests, t, tl, h, n]) => {
      setCaseData(c);
      setDocuments(docs);
      setDocumentRequests(requests || []);
      setTasks(t);
      setTimeline(tl);
      setHearings(h);
      setNotes(n);
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

  const handleUploadDocument = async (keepOpen = false) => {
    if (!uploadFile) {
      toast.error('Please choose a file to upload');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('name', uploadName.trim() || uploadFile.name);
      fd.append('category', uploadCategory);
      if (uploadDescription) fd.append('description', uploadDescription);

      const newDoc = await caseService.uploadDocument(caseId, fd);
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success(`"${newDoc.name}" uploaded successfully!`);

      setUploadFile(null);
      setUploadName('');
      setUploadCategory('Legal');
      setUploadDescription('');

      if (!keepOpen) {
        setShowUploadModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDocumentRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.title.trim()) {
      toast.error('Please enter a request title');
      return;
    }
    setRequesting(true);
    try {
      const reqDoc = await caseService.createDocumentRequest(caseId, requestForm);
      setDocumentRequests((prev) => [reqDoc, ...prev]);
      toast.success('Document request sent to client!');
      setShowRequestModal(false);
      setRequestForm({ title: '', description: '', category: 'Evidence', dueDate: '' });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to request document');
    } finally {
      setRequesting(false);
    }
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="p-2.5 rounded-xl bg-chamber-50 border border-chamber-100 text-chamber-700 shrink-0 mt-0.5">
            <Scale className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-ink truncate">{caseData.title}</h1>
              <Badge variant={STATUS_COLORS[caseData.status] || 'default'}>{caseData.status}</Badge>
              <Badge variant={PRIORITY_COLORS[caseData.priority] || 'default'}>{caseData.priority} priority</Badge>
            </div>
            <p className="text-sm text-ink-muted mt-1 font-mono">
              #{caseData.caseId || caseData._id.slice(-6)} • {caseData.practiceArea}
              {caseData.courtName && ` • ${caseData.courtName}`}
              {caseData.caseNumber && ` • Filing: ${caseData.caseNumber}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Avatar name={caseData.client?.name} src={caseData.client?.avatar?.url} size="xs" />
              <span className="text-sm font-medium text-ink">{caseData.client?.name}</span>
              {caseData.client?.email && <span className="text-xs text-ink-muted">({caseData.client.email})</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-medium text-ink-muted">Status:</label>
            <select
              value={caseData.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="input-base text-xs py-1.5 w-auto font-medium"
            >
              {CASE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <Tabs tabs={tabsWithCount} activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="panel p-4 text-center">
            <p className="text-2xl font-bold text-ink">{tasks.filter((t) => t.status !== 'completed').length}</p>
            <p className="text-sm text-ink-muted">Open tasks</p>
          </div>
          <div className="panel p-4 text-center">
            <p className="text-2xl font-bold text-ink">{documents.length}</p>
            <p className="text-sm text-ink-muted">Documents</p>
          </div>
          <div className="panel p-4 text-center">
            <p className="text-2xl font-bold text-ink">{hearings.filter((h) => new Date(h.date) >= new Date()).length}</p>
            <p className="text-sm text-ink-muted">Upcoming hearings</p>
          </div>
          <div className="panel p-4 text-center">
            <p className="text-2xl font-bold text-ink">{notes.length}</p>
            <p className="text-sm text-ink-muted">Private notes</p>
          </div>
        </div>
      )}

      {/* Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowTaskModal(true)}>
              <Plus className="h-4 w-4" /> Assign Task
            </Button>
          </div>
          {tasks.length === 0 ? (
            <div className="panel p-10 text-center text-ink-muted">No tasks assigned yet</div>
          ) : (
            <div className="panel divide-y divide-line">
              {tasks.map((task) => (
                <div key={task._id} className="flex items-start gap-3 p-4">
                  <CheckCircle className={`h-5 w-5 mt-0.5 ${task.status === 'completed' ? 'text-emerald-500' : 'text-ink-muted'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-ink-muted' : 'text-ink'}`}>
                      {task.title}
                    </p>
                    {task.description && <p className="text-xs text-ink-muted mt-0.5">{task.description}</p>}
                    <div className="flex gap-2 mt-1.5 items-center">
                      <Badge variant={PRIORITY_COLORS[task.priority]} size="xs">{task.priority}</Badge>
                      {task.dueDate && <span className="text-xs text-ink-muted">Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>}
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
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-base text-ink">Case Filings & Evidence</h3>
              <p className="text-xs text-ink-muted">Manage, review, upload, or request legal files from the client</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRequestModal(true)}
                className="gap-1.5 text-xs"
              >
                <Send className="h-3.5 w-3.5" /> Request Document
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowUploadModal(true)}
                className="gap-1.5 text-xs"
              >
                <Upload className="h-3.5 w-3.5" /> Upload Document
              </Button>
            </div>
          </div>

          {/* Pending Document Requests Section */}
          {documentRequests.length > 0 && (
            <div className="panel p-4 space-y-3 bg-amber-50/40 border-amber-200">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Client Document Requests ({documentRequests.length})
                </h4>
              </div>
              <div className="divide-y divide-amber-100">
                {documentRequests.map((req) => (
                  <div key={req._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink">{req.title}</p>
                        <Badge variant={req.status === 'Fulfilled' ? 'success' : 'warning'} size="xs">
                          {req.status}
                        </Badge>
                      </div>
                      {req.description && <p className="text-ink-muted text-[11px] truncate mt-0.5">{req.description}</p>}
                    </div>
                    <div className="text-right shrink-0 text-ink-muted text-[11px]">
                      {req.dueDate && <p>Due: {format(new Date(req.dueDate), 'MMM d, yyyy')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Documents List */}
          {documents.length === 0 ? (
            <div className="panel p-12 text-center space-y-2">
              <FileText className="mx-auto h-10 w-10 text-ink-muted opacity-60" />
              <p className="font-medium text-ink">No documents uploaded to this case yet</p>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Upload your petitions, vakalatnama, evidence, or request critical records from your client.
              </p>
              <Button size="sm" onClick={() => setShowUploadModal(true)} className="gap-1.5 mt-2">
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
            </div>
          ) : (
            <div className="panel divide-y divide-line shadow-sm overflow-hidden">
              {documents.map((doc) => {
                const isImage = doc.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.name || doc.url);
                return (
                  <div key={doc._id} className="flex items-center gap-3 p-4 hover:bg-paper/40 transition-colors">
                    <div className="p-1.5 rounded-lg bg-chamber-50 text-chamber-700 shrink-0">
                      {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setPreviewDoc({ ...doc, caseTitle: caseData?.title })}
                    >
                      <p className="font-semibold text-sm text-ink truncate hover:text-chamber-700 transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-xs text-ink-muted">
                        <span className="font-medium text-ink">{doc.category || 'Other'}</span> • {formatFileSize(doc.size)} • Uploaded by {doc.uploadedBy?.name || 'Advocate'}
                        {doc.createdAt && ` on ${format(new Date(doc.createdAt), 'MMM d, yyyy')}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.isReviewed ? (
                        <Badge variant="success" size="xs">Reviewed</Badge>
                      ) : (
                        <button
                          onClick={() => reviewDoc(doc._id)}
                          className="text-xs text-chamber-600 hover:underline px-2 py-1 rounded-md bg-chamber-50 border border-chamber-200 font-medium"
                        >
                          Mark Reviewed
                        </button>
                      )}

                      <button
                        onClick={() => setPreviewDoc({ ...doc, caseTitle: caseData?.title })}
                        className="rounded-lg p-1.5 text-chamber-700 hover:bg-chamber-50 transition-colors"
                        title="Preview document inline"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => downloadFile(doc.url, doc.originalName || doc.name)}
                        className="rounded-lg p-1.5 text-ink-muted hover:text-ink hover:bg-paper transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Hearings */}
      {activeTab === 'hearings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowHearingModal(true)}>
              <Plus className="h-4 w-4" /> Schedule Hearing
            </Button>
          </div>
          {hearings.length === 0 ? (
            <div className="panel p-10 text-center text-ink-muted">No hearings scheduled</div>
          ) : (
            hearings.map((h) => (
              <div key={h._id} className="panel p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-ink text-base">{h.purpose}</p>
                    <p className="text-xs text-chamber-700 font-medium mt-0.5">{h.court}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      {format(new Date(h.date), 'EEEE, MMMM d, yyyy')} at {h.time}
                    </p>
                  </div>
                  <Badge variant={new Date(h.date) < new Date() ? 'default' : 'warning'}>
                    {new Date(h.date) < new Date() ? 'Completed' : 'Upcoming Hearing'}
                  </Badge>
                </div>
                {h.notes && <p className="text-xs text-ink-soft border-t border-line pt-2">{h.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Timeline */}
      {activeTab === 'timeline' && (
        <div className="relative ml-4 pl-6 border-l-2 border-line space-y-6">
          {timeline.length === 0 ? (
            <div className="panel p-10 text-center text-ink-muted">No timeline events yet</div>
          ) : (
            timeline.map((event) => (
              <div key={event._id} className="relative">
                <div className="timeline-dot bg-chamber-600 ring-chamber-200" />
                <div className="panel p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-ink">{event.title}</p>
                      {event.description && <p className="text-sm text-ink-soft mt-0.5">{event.description}</p>}
                    </div>
                    <p className="text-xs text-ink-muted shrink-0 ml-3">
                      {format(new Date(event.eventDate || event.createdAt), 'MMM d, yyyy')}
                    </p>
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
            <Button size="sm" onClick={() => setShowNoteModal(true)}>
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          </div>
          {notes.length === 0 ? (
            <div className="panel p-10 text-center text-ink-muted">No private notes yet. Notes are only visible to you.</div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="panel p-5">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-ink leading-relaxed flex-1 whitespace-pre-wrap">{note.content}</p>
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
            {messages.length === 0 && <div className="flex items-center justify-center h-full text-ink-muted text-sm">Start the conversation with your client.</div>}
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
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message to client..." className="input-base flex-1 text-sm" />
            <Button type="submit" size="sm" disabled={!chatInput.trim()}>Send</Button>
          </form>
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Case Document"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUploadDocument(true)}
              loading={uploading}
              disabled={!uploadFile}
              className="w-full sm:w-auto"
            >
              Upload & Add Another
            </Button>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUploadDocument(false)}
                loading={uploading}
                disabled={!uploadFile}
                className="w-full sm:w-auto"
              >
                Upload & Finish
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Select Document File <span className="text-danger-500">*</span>
            </label>
            <FileDropzone
              onFile={(f) => {
                setUploadFile(f);
                if (f && !uploadName) {
                  setUploadName(f.name.replace(/\.[^/.]+$/, ''));
                }
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Document Name / Title
              </label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g. Counter Affidavit / Rejoinder"
                className="input-base text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="input-base text-xs"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Remarks, filing date, or remarks for client..."
              className="input-base text-xs resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Request Document Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Document from Client"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="secondary" size="sm" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateDocumentRequest}
              loading={requesting}
              disabled={!requestForm.title.trim()}
            >
              Send Request
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateDocumentRequest} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Document Title <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={requestForm.title}
              onChange={(e) => setRequestForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Sale Deed (2018) / Bank Passbook Copy"
              className="input-base text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Category
              </label>
              <select
                value={requestForm.category}
                onChange={(e) => setRequestForm((p) => ({ ...p, category: e.target.value }))}
                className="input-base text-xs"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={requestForm.dueDate}
                onChange={(e) => setRequestForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="input-base text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Instructions for Client
            </label>
            <textarea
              rows={3}
              value={requestForm.description}
              onChange={(e) => setRequestForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Explain why this document is required and any specific format (e.g. original scanned PDF)..."
              className="input-base text-xs resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Assign Task"
        footer={<><Button variant="secondary" onClick={() => setShowTaskModal(false)}>Cancel</Button><Button onClick={createTask} loading={saving}>Create Task</Button></>}
      >
        <div className="space-y-4 text-left">
          <div><label className="block text-xs font-semibold text-ink mb-1">Title *</label><input value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} className="input-base text-xs" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-1">Description</label><textarea rows={2} value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} className="input-base text-xs resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-ink mb-1">Due Date</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))} className="input-base text-xs" /></div>
            <div><label className="block text-xs font-semibold text-ink mb-1">Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))} className="input-base text-xs">
                {['low', 'medium', 'high'].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Hearing Modal */}
      <Modal
        isOpen={showHearingModal}
        onClose={() => setShowHearingModal(false)}
        title="Schedule Hearing"
        footer={<><Button variant="secondary" onClick={() => setShowHearingModal(false)}>Cancel</Button><Button onClick={createHearing} loading={saving}>Schedule</Button></>}
      >
        <div className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-ink mb-1">Date *</label><input type="date" value={hearingForm.date} onChange={(e) => setHearingForm((p) => ({ ...p, date: e.target.value }))} className="input-base text-xs" /></div>
            <div><label className="block text-xs font-semibold text-ink mb-1">Time</label><input type="time" value={hearingForm.time} onChange={(e) => setHearingForm((p) => ({ ...p, time: e.target.value }))} className="input-base text-xs" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-ink mb-1">Court / Location *</label><input value={hearingForm.court} onChange={(e) => setHearingForm((p) => ({ ...p, court: e.target.value }))} className="input-base text-xs" placeholder="e.g. Delhi High Court" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-1">Purpose</label><input value={hearingForm.purpose} onChange={(e) => setHearingForm((p) => ({ ...p, purpose: e.target.value }))} className="input-base text-xs" placeholder="e.g. Evidence submission / Final arguments" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-1">Notes</label><textarea rows={2} value={hearingForm.notes} onChange={(e) => setHearingForm((p) => ({ ...p, notes: e.target.value }))} className="input-base text-xs resize-none" /></div>
        </div>
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Private Note"
        footer={<><Button variant="secondary" onClick={() => setShowNoteModal(false)}>Cancel</Button><Button onClick={createNote} loading={saving}>Save Note</Button></>}
      >
        <textarea rows={5} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write your private case notes here (only visible to you)..." className="input-base text-xs resize-none w-full" />
      </Modal>

      {/* In-Website Document Viewer Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
