import { useEffect, useState } from 'react';
import { consultationService } from '../../services/consultationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { Calendar, Clock, Video, MessageSquare, Users, X, Check, AlertCircle, FileText, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  Pending: 'warning',
  Confirmed: 'success',
  Rejected: 'danger',
  Cancelled: 'danger',
  Completed: 'default',
};

const MODE_ICONS = {
  video: Video,
  chat: MessageSquare,
  'in-person': Users,
};

const STATUSES = ['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function AdvocateConsultations() {
  const toast = useToast();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null); // { id }
  const [rejectionReason, setRejectionReason] = useState('Schedule conflict');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await consultationService.list({ status: statusFilter, limit: 50 });
      setConsultations(d.consultations || []);
    } catch {
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await consultationService.updateStatus(id, { status: 'Confirmed' });
      toast.success('Consultation confirmed! Client notified.');
      if (selectedConsultation?._id === id) {
        setSelectedConsultation((prev) => ({ ...prev, status: 'Confirmed' }));
      }
      load();
    } catch {
      toast.error('Failed to confirm consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog?.id) return;
    setActionLoading(true);
    try {
      await consultationService.updateStatus(rejectDialog.id, {
        status: 'Rejected',
        reason: rejectionReason || 'Unavailable at this time',
      });
      toast.info('Consultation rejected');
      setRejectDialog(null);
      if (selectedConsultation?._id === rejectDialog.id) {
        setSelectedConsultation((prev) => ({ ...prev, status: 'Rejected', rejectionReason }));
      }
      load();
    } catch {
      toast.error('Failed to reject consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (id) => {
    setActionLoading(true);
    try {
      await consultationService.updateStatus(id, { status: 'Completed' });
      toast.success('Consultation marked as completed');
      if (selectedConsultation?._id === id) {
        setSelectedConsultation((prev) => ({ ...prev, status: 'Completed' }));
      }
      load();
    } catch {
      toast.error('Failed to update consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCaseFromConsultation = (c) => {
    navigate('/advocate/cases', {
      state: {
        prefillClientId: c.client?._id,
        prefillConsultationId: c._id,
        prefillTitle: `${c.practiceArea || 'Legal'} Matter — ${c.client?.name || 'Client'}`,
        prefillPracticeArea: c.practiceArea || 'Civil Litigation',
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Client Consultations</h1>
          <p className="text-ink-soft text-sm mt-0.5">Manage incoming requests, join sessions, and track client inquiries</p>
        </div>
        <Button to="/advocate/calendar" variant="secondary" size="sm" className="gap-1.5 self-start sm:self-auto">
          <Calendar className="h-4 w-4" /> Set Working Hours
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? 'border-chamber-600 bg-chamber-600 text-white shadow-sm'
                : 'border-line bg-white text-ink-muted hover:border-chamber-300'
            }`}
          >
            {s || 'All Requests'}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTable />
      ) : consultations.length === 0 ? (
        <div className="panel p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-ink-muted mb-3 opacity-60" />
          <p className="text-lg font-semibold text-ink">No consultations found</p>
          <p className="text-xs text-ink-muted mt-1">
            {statusFilter
              ? `No requests currently marked as "${statusFilter}".`
              : 'New client bookings and appointments will appear here.'}
          </p>
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
                  <Avatar name={c.client?.name} src={c.client?.avatar?.url} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink text-sm truncate">{c.client?.name}</p>
                      <Badge variant={STATUS_COLORS[c.status] || 'default'} size="xs">
                        {c.status}
                      </Badge>
                      {c.practiceArea && (
                        <span className="text-[11px] text-chamber-700 bg-chamber-50 border border-chamber-200 px-2 py-0.5 rounded-md font-medium">
                          {c.practiceArea}
                        </span>
                      )}
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
                    Details
                  </Button>

                  {c.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAccept(c._id)}
                        loading={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setRejectDialog({ id: c._id });
                          setRejectionReason('Schedule conflict');
                        }}
                        className="text-xs"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {c.status === 'Confirmed' && (
                    <>
                      {c.mode === 'video' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate(`/advocate/consultations/${c._id}/video`)}
                          className="gap-1.5 shadow-sm text-xs"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Video
                        </Button>
                      )}
                      {c.mode === 'chat' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate('/advocate/messages')}
                          className="gap-1.5 text-xs"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Chat
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleComplete(c._id)}
                        className="text-xs text-ink-soft hover:text-ink"
                      >
                        Mark Done
                      </Button>
                      {!c.case && (c.status === 'Confirmed' || c.status === 'Completed') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateCaseFromConsultation(c)}
                          className="gap-1 text-xs text-chamber-700 border-chamber-200 hover:bg-chamber-50"
                        >
                          <Scale className="h-3.5 w-3.5" /> Open Case
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advocate Consultation Details Drawer/Modal */}
      {selectedConsultation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold text-lg text-ink">Client Matter Brief</h3>
                <p className="text-xs text-ink-muted">Ref: {selectedConsultation._id}</p>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-paper transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Client info */}
            <div className="p-3.5 rounded-xl bg-paper/60 border border-line flex items-center gap-3">
              <Avatar
                name={selectedConsultation.client?.name}
                src={selectedConsultation.client?.avatar?.url}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink">{selectedConsultation.client?.name}</p>
                <p className="text-xs text-ink-muted">{selectedConsultation.client?.email || 'Client'}</p>
              </div>
              <Badge variant={STATUS_COLORS[selectedConsultation.status] || 'default'}>
                {selectedConsultation.status}
              </Badge>
            </div>

            {/* Timing */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-line bg-white">
                <span className="text-ink-muted block mb-1">Appointment Slot</span>
                <span className="font-semibold text-ink block">
                  {format(new Date(selectedConsultation.date), 'EEEE, MMM d, yyyy')}
                </span>
                <span className="text-chamber-700 font-medium">{selectedConsultation.timeSlot}</span>
              </div>
              <div className="p-3 rounded-lg border border-line bg-white">
                <span className="text-ink-muted block mb-1">Session Mode</span>
                <span className="font-semibold text-ink capitalize block">
                  {selectedConsultation.mode} Consultation
                </span>
                <span className="text-ink-muted">{selectedConsultation.duration || 60} Minutes</span>
              </div>
            </div>

            {/* Legal Issue */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                Client's Legal Issue Description
              </label>
              <div className="p-3.5 rounded-xl border border-line bg-paper/30 text-xs text-ink-soft whitespace-pre-wrap leading-relaxed">
                {selectedConsultation.legalIssue || 'No description entered by client.'}
              </div>
              {selectedConsultation.practiceArea && (
                <p className="text-[11px] text-ink-muted mt-1.5">
                  Categorized Practice Area: <strong className="text-ink">{selectedConsultation.practiceArea}</strong>
                </p>
              )}
            </div>

            {/* Fee & Escrow Status */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex justify-between font-medium text-emerald-900">
                <span>Earned Consultation Fee:</span>
                <span className="font-bold">₹{selectedConsultation.fee?.toLocaleString() || '—'}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800">
                <span>Client Payment:</span>
                <span>✓ Secured in Escrow</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-line">
              {selectedConsultation.status === 'Pending' && (
                <>
                  <Button
                    variant="primary"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleAccept(selectedConsultation._id)}
                    loading={actionLoading}
                  >
                    Accept Consultation
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setRejectDialog({ id: selectedConsultation._id });
                      setRejectionReason('Schedule conflict');
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}

              {selectedConsultation.status === 'Confirmed' && selectedConsultation.mode === 'video' && (
                <Button
                  to={`/advocate/consultations/${selectedConsultation._id}/video`}
                  className="flex-1 gap-1.5"
                  variant="primary"
                >
                  <Video className="h-4 w-4" /> Launch Video Room
                </Button>
              )}

              {selectedConsultation.status === 'Confirmed' && (
                <Button
                  variant="secondary"
                  onClick={() => handleComplete(selectedConsultation._id)}
                >
                  Mark Completed
                </Button>
              )}

              {!selectedConsultation.case && (selectedConsultation.status === 'Confirmed' || selectedConsultation.status === 'Completed') && (
                <Button
                  variant="outline"
                  onClick={() => handleCreateCaseFromConsultation(selectedConsultation)}
                  className="gap-1.5 border-chamber-300 text-chamber-700 hover:bg-chamber-50"
                >
                  <Scale className="h-4 w-4" /> Open Legal Case
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

      {/* Reject Reason Modal */}
      {rejectDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-4 animate-slide-up">
            <h3 className="font-bold text-ink text-base">Decline Consultation</h3>
            <p className="text-xs text-ink-muted">Please provide a reason to inform the client.</p>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">Reason</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input-base text-xs"
              >
                <option value="Schedule conflict">Schedule conflict / unavailable slot</option>
                <option value="Outside practice expertise">Matter is outside my practice jurisdiction</option>
                <option value="Conflict of interest">Potential conflict of interest</option>
                <option value="Court appearance scheduled">Urgent court appearance on this date</option>
                <option value="Personal emergency">Personal emergency / on leave</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setRejectDialog(null)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                loading={actionLoading}
                className="flex-1 text-xs"
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
