import { useEffect, useState } from 'react';
import { consultationService } from '../../services/consultationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { Calendar, Clock, Video, MessageSquare, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

const STATUS_COLORS = { Pending: 'warning', Confirmed: 'success', Rejected: 'danger', Cancelled: 'danger', Completed: 'default' };
const MODE_ICONS = { video: Video, chat: MessageSquare, 'in-person': Users };
const STATUSES = ['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function AdvocateConsultations() {
  const toast = useToast();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await consultationService.list({ status: statusFilter, limit: 50 });
      setConsultations(d.consultations || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleAction = async () => {
    try {
      await consultationService.updateStatus(confirm.id, { status: confirm.action });
      toast.success(`Consultation ${confirm.action.toLowerCase()}`);
      setConfirm(null);
      load();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Consultations</h1>
        <p className="text-ink-soft mt-1">Manage incoming and upcoming consultation requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === s ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line bg-white text-ink-muted hover:border-chamber-300'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <SkeletonTable /> : consultations.length === 0 ? (
        <div className="panel p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No consultations</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {consultations.map((c) => {
            const ModeIcon = MODE_ICONS[c.mode] || Calendar;
            return (
              <div key={c._id} className="flex items-center gap-4 p-4">
                <Avatar name={c.client?.name} src={c.client?.avatar?.url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{c.client?.name}</p>
                  <div className="flex items-center gap-3 text-xs text-ink-muted mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(c.date), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.timeSlot}</span>
                    <span className="flex items-center gap-1 capitalize"><ModeIcon className="h-3 w-3" />{c.mode}</span>
                  </div>
                  {c.legalIssue && <p className="text-xs text-ink-muted mt-0.5 truncate max-w-xs">{c.legalIssue}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_COLORS[c.status] || 'default'}>{c.status}</Badge>
                  {c.status === 'Pending' && (
                    <>
                      <Button size="sm" variant="primary" onClick={() => setConfirm({ id: c._id, action: 'Confirmed', label: 'Confirm' })}>Accept</Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirm({ id: c._id, action: 'Rejected', label: 'Reject' })}>Reject</Button>
                    </>
                  )}
                  {c.status === 'Confirmed' && (
                    <div className="flex items-center gap-2">
                      {c.mode === 'video' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate(`/advocate/consultations/${c._id}/video`)}
                          className="flex items-center gap-1.5"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Call
                        </Button>
                      )}
                      {c.mode === 'chat' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate('/advocate/messages')}
                          className="flex items-center gap-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Open Chat
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirm({ id: c._id, action: 'Completed', label: 'Mark Completed' })}
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title={`${confirm?.label} Consultation`}
        message={`Are you sure you want to ${confirm?.label?.toLowerCase()} this consultation?`}
        confirmLabel={confirm?.label || 'Confirm'}
        danger={confirm?.action === 'Rejected' || confirm?.action === 'Cancelled'}
      />
    </div>
  );
}
