import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Video, MessageSquare, Users, Clock,
  ChevronRight, X, AlertCircle, CheckCircle, IndianRupee,
  FileText, ShieldCheck, ArrowRight
} from 'lucide-react';
import { consultationService } from '../../services/consultationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { format } from 'date-fns';

const STATUS_COLORS = {
  Pending: 'warning',
  Confirmed: 'success',
  Rejected: 'danger',
  Cancelled: 'danger',
  Completed: 'default',
  'No-show': 'danger',
};

const MODE_ICONS = {
  video: Video,
  chat: MessageSquare,
  'in-person': Users,
};

const STATUSES = ['', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'];

export default function ClientConsultations() {
  const toast = useToast();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await consultationService.list({ status: statusFilter, page, limit: 10 });
      setConsultations(data.consultations || []);
      setPages(data.pages || 1);
    } catch {
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, page]);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this consultation?')) return;
    try {
      await consultationService.updateStatus(id, { status: 'Cancelled', reason: 'Cancelled by client request' });
      toast.success('Consultation cancelled successfully');
      setSelectedConsultation(null);
      load();
    } catch {
      toast.error('Failed to cancel consultation');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Consultations</h1>
          <p className="text-ink-soft text-sm mt-0.5">Manage, track, and join your legal consultations</p>
        </div>
        <Button to="/client/advocates" size="sm" className="gap-1.5 shadow-sm">
          <Calendar className="h-4 w-4" /> Book New Consultation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? 'border-chamber-600 bg-chamber-600 text-white shadow-sm'
                : 'border-line bg-white text-ink-muted hover:border-chamber-300'
            }`}
          >
            {s || 'All Consultations'}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTable />
      ) : consultations.length === 0 ? (
        <div className="panel p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-ink-muted mb-3 opacity-60" />
          <p className="text-lg font-semibold text-ink">No consultations found</p>
          <p className="text-sm text-ink-muted mt-1 max-w-sm mx-auto">
            {statusFilter
              ? `You do not have any consultations with status "${statusFilter}".`
              : 'You have not booked any consultations yet. Find verified advocates to get started.'}
          </p>
          <Button to="/client/advocates" className="mt-5 gap-1.5" size="md">
            Find an Advocate Now
          </Button>
        </div>
      ) : (
        <div className="panel divide-y divide-line overflow-hidden">
          {consultations.map((c) => {
            const ModeIcon = MODE_ICONS[c.mode] || Calendar;
            return (
              <div
                key={c._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper/40 transition-colors cursor-pointer"
                onClick={() => setSelectedConsultation(c)}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <Avatar name={c.advocate?.name} src={c.advocate?.avatar?.url} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink text-sm truncate">{c.advocate?.name}</p>
                      <Badge variant={STATUS_COLORS[c.status] || 'default'} size="xs">
                        {c.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted mt-1">
                      <span className="flex items-center gap-1 font-medium text-ink-soft">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(c.date), 'EEE, MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-ink-soft">
                        <Clock className="h-3.5 w-3.5" />
                        {c.timeSlot} ({c.duration || 60}m)
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <ModeIcon className="h-3.5 w-3.5 text-chamber-600" />
                        {c.mode}
                      </span>
                    </div>
                    {c.legalIssue && (
                      <p className="text-xs text-ink-muted mt-1.5 line-clamp-1 max-w-lg">
                        {c.legalIssue}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 self-end sm:self-center shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedConsultation(c)}
                    className="text-xs"
                  >
                    View Details
                  </Button>

                  {c.status === 'Confirmed' && c.mode === 'video' && (
                    <Button
                      to={`/client/consultations/${c._id}/video`}
                      size="sm"
                      variant="primary"
                      className="gap-1.5 shadow-sm"
                    >
                      <Video className="h-3.5 w-3.5" /> Join Call
                    </Button>
                  )}

                  {c.status === 'Confirmed' && c.mode === 'chat' && (
                    <Button
                      to="/client/messages"
                      size="sm"
                      variant="primary"
                      className="gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Open Chat
                    </Button>
                  )}

                  {c.status === 'Pending' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCancel(c._id)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-paper"
          >
            Previous
          </button>
          <span className="text-xs text-ink-muted self-center">Page {page} of {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-paper"
          >
            Next
          </button>
        </div>
      )}

      {/* Consultation Details Modal */}
      {selectedConsultation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold text-lg text-ink">Consultation Details</h3>
                <p className="text-xs text-ink-muted">Ref: {selectedConsultation._id}</p>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-paper transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Advocate Card */}
            <div className="p-3.5 rounded-xl bg-paper/60 border border-line flex items-center gap-3">
              <Avatar
                name={selectedConsultation.advocate?.name}
                src={selectedConsultation.advocate?.avatar?.url}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink">{selectedConsultation.advocate?.name}</p>
                <p className="text-xs text-ink-muted">{selectedConsultation.advocate?.email}</p>
              </div>
              <Badge variant={STATUS_COLORS[selectedConsultation.status] || 'default'}>
                {selectedConsultation.status}
              </Badge>
            </div>

            {/* Schedule Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-line bg-white">
                <span className="text-ink-muted block mb-1">Date & Time</span>
                <span className="font-semibold text-ink block">
                  {format(new Date(selectedConsultation.date), 'EEEE, MMM d, yyyy')}
                </span>
                <span className="text-chamber-700 font-medium">{selectedConsultation.timeSlot}</span>
              </div>
              <div className="p-3 rounded-lg border border-line bg-white">
                <span className="text-ink-muted block mb-1">Mode & Duration</span>
                <span className="font-semibold text-ink capitalize block">
                  {selectedConsultation.mode} Session
                </span>
                <span className="text-ink-muted">{selectedConsultation.duration || 60} Minutes</span>
              </div>
            </div>

            {/* Legal Issue */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                Legal Matter / Inquiry
              </label>
              <div className="p-3.5 rounded-xl border border-line bg-paper/30 text-xs text-ink-soft whitespace-pre-wrap leading-relaxed">
                {selectedConsultation.legalIssue || 'No description provided.'}
              </div>
              {selectedConsultation.practiceArea && (
                <p className="text-[11px] text-ink-muted mt-1">
                  Practice Area: <strong className="text-ink">{selectedConsultation.practiceArea}</strong>
                </p>
              )}
            </div>

            {/* Fee & Payment status */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex justify-between font-medium text-emerald-900">
                <span>Fee Amount:</span>
                <span className="font-bold">₹{selectedConsultation.fee?.toLocaleString() || '—'}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800">
                <span>Payment State:</span>
                <span className="capitalize">{selectedConsultation.payment?.status || 'Escrow Handled'}</span>
              </div>
              {selectedConsultation.payment?.receiptNumber && (
                <div className="flex justify-between text-[11px] text-emerald-700">
                  <span>Receipt No:</span>
                  <span className="font-mono">{selectedConsultation.payment.receiptNumber}</span>
                </div>
              )}
            </div>

            {/* Rejection / Cancellation note */}
            {selectedConsultation.rejectionReason && (
              <div className="p-3 rounded-xl bg-danger-50 border border-danger-200 text-xs text-danger-700">
                <p className="font-semibold">Rejection Reason:</p>
                <p className="mt-0.5">{selectedConsultation.rejectionReason}</p>
              </div>
            )}
            {selectedConsultation.cancellationReason && (
              <div className="p-3 rounded-xl bg-danger-50 border border-danger-200 text-xs text-danger-700">
                <p className="font-semibold">Cancellation Reason:</p>
                <p className="mt-0.5">{selectedConsultation.cancellationReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-line">
              {selectedConsultation.status === 'Confirmed' && selectedConsultation.mode === 'video' && (
                <Button
                  to={`/client/consultations/${selectedConsultation._id}/video`}
                  className="flex-1 gap-1.5"
                  variant="primary"
                >
                  <Video className="h-4 w-4" /> Join Video Room
                </Button>
              )}
              {selectedConsultation.status === 'Confirmed' && selectedConsultation.mode === 'chat' && (
                <Button to="/client/messages" className="flex-1 gap-1.5" variant="primary">
                  <MessageSquare className="h-4 w-4" /> Chat with Advocate
                </Button>
              )}
              {selectedConsultation.status === 'Pending' && (
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleCancel(selectedConsultation._id)}
                >
                  Cancel Booking
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setSelectedConsultation(null)}
                className="shrink-0"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
