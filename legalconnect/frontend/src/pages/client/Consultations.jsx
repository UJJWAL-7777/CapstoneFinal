import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Video, MessageSquare, Users, Clock, ChevronRight } from 'lucide-react';
import { consultationService } from '../../services/consultationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { format } from 'date-fns';

const STATUS_COLORS = {
  Pending: 'warning', Confirmed: 'success', Rejected: 'danger',
  Cancelled: 'danger', Completed: 'default', 'No-show': 'danger',
};
const MODE_ICONS = { video: Video, chat: MessageSquare, 'in-person': Users };

const STATUSES = ['', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'];

export default function Consultations() {
  const toast = useToast();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const data = await consultationService.list({ status: statusFilter, page, limit: 10 });
      setConsultations(data.consultations || []);
      setPages(data.pages || 1);
    } catch { toast.error('Failed to load consultations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter, page]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this consultation?')) return;
    try {
      await consultationService.updateStatus(id, { status: 'Cancelled', reason: 'Cancelled by client' });
      toast.success('Consultation cancelled');
      load();
    } catch { toast.error('Failed to cancel'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">My Consultations</h1>
          <p className="text-ink-soft mt-1">Track and manage your booked consultations</p>
        </div>
        <Button to="/client/advocates" size="sm">Book New</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === s ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line bg-white text-ink-muted hover:border-chamber-300'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <SkeletonTable /> : consultations.length === 0 ? (
        <div className="panel p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No consultations found</p>
          <Button to="/client/advocates" className="mt-4">Find an Advocate</Button>
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {consultations.map((c) => {
            const ModeIcon = MODE_ICONS[c.mode] || Calendar;
            return (
              <div key={c._id} className="p-4 flex items-center gap-4 hover:bg-paper/50 transition-colors">
                <Avatar name={c.advocate?.name} src={c.advocate?.avatar?.url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{c.advocate?.name}</p>
                  <div className="flex items-center gap-3 text-sm text-ink-muted mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(c.date), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.timeSlot}</span>
                    <span className="flex items-center gap-1 capitalize"><ModeIcon className="h-3.5 w-3.5" />{c.mode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_COLORS[c.status] || 'default'}>{c.status}</Badge>
                  {c.status === 'Confirmed' && c.mode === 'video' && (
                    <Button to={`/client/consultations/${c._id}/video`} size="sm" variant="primary">Join</Button>
                  )}
                  {c.status === 'Pending' && (
                    <button onClick={() => handleCancel(c._id)} className="text-xs text-danger-500 hover:underline">Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-line px-3 py-1.5 text-sm disabled:opacity-40">Previous</button>
          <span className="text-sm text-ink-muted self-center">Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-line px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
