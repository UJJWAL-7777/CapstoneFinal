import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { ShieldCheck, Clock, MapPin, Award, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../../components/ui/Modal.jsx';

const STATUSES = ['Pending,Under Review', 'Verified', 'Rejected', 'Suspended'];
const STATUS_COLORS = {
  Verified: 'success',
  Pending: 'warning',
  'Under Review': 'info',
  Rejected: 'danger',
  Suspended: 'danger',
};

const REJECTION_PRESETS = [
  'Invalid or unverified Bar Council enrollment number.',
  'Bar Council registration certificate scan is illegible or missing.',
  'Discrepancy between registered advocate name and state bar council records.',
  'Incomplete mandatory identity documents provided.',
];

export default function AdminVerification() {
  const toast = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending,Under Review');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getVerificationQueue({ status: filter, limit: 50 });
      setProfiles(data.profiles || []);
    } catch {
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleDecision = async (status) => {
    if (status === 'Rejected' && !notes.trim()) {
      toast.error('Please specify a rejection reason or select a preset note');
      return;
    }

    setProcessing(true);
    try {
      await adminService.updateVerification(selected.user._id, { status, notes: notes.trim() });
      toast.success(
        status === 'Verified'
          ? 'Advocate successfully verified & credentialed!'
          : `Application status updated to ${status}`
      );
      setSelected(null);
      setNotes('');
      load();
    } catch {
      toast.error('Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-chamber-700" /> Advocate Verification Queue
        </h1>
        <p className="text-ink-soft text-sm mt-0.5">
          Authenticate Bar Council credentials and grant verified practitioner status
        </p>
      </div>

      {/* Queue Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === s
                ? 'border-chamber-600 bg-chamber-600 text-white shadow-sm'
                : 'border-line bg-white text-ink-muted hover:border-chamber-300'
            }`}
          >
            {s === 'Pending,Under Review' ? 'Action Queue (Pending & Under Review)' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTable />
      ) : profiles.length === 0 ? (
        <div className="panel p-12 text-center space-y-2">
          <ShieldCheck className="mx-auto h-10 w-10 text-ink-muted opacity-40" />
          <p className="text-base font-semibold text-ink">No applications in this queue</p>
          <p className="text-xs text-ink-muted">All submissions for this status filter have been processed.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line overflow-hidden border border-line">
          {profiles.map((p) => (
            <div key={p._id} className="flex items-center gap-4 p-4 hover:bg-paper/30 transition-colors">
              <Avatar name={p.user?.name} src={p.user?.avatar?.url} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-ink truncate">{p.user?.name}</p>
                  <span className="font-mono text-xs text-chamber-700 font-semibold bg-chamber-50 px-2 py-0.5 rounded border border-chamber-200">
                    {p.barCouncilNumber || 'No Bar ID'}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{p.user?.email}</p>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-ink-muted">
                  {p.location?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-chamber-600" />
                      {p.location.city}, {p.location.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-brass-600" />
                    {p.experienceYears || 0} years experience
                  </span>
                  <span>Applied {format(new Date(p.user?.createdAt || p.createdAt || Date.now()), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Badge variant={STATUS_COLORS[p.verificationStatus] || 'default'} size="xs">
                  {p.verificationStatus}
                </Badge>
                <Button size="sm" onClick={() => setSelected(p)} className="gap-1 shadow-sm">
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Inspection & Decision Modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Review Credentials — ${selected.user?.name}`}
          size="lg"
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <Button variant="secondary" onClick={() => setSelected(null)} disabled={processing}>
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  onClick={() => handleDecision('Rejected')}
                  loading={processing}
                  className="gap-1"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDecision('Under Review')}
                  loading={processing}
                  className="gap-1"
                >
                  Under Review
                </Button>
                <Button
                  onClick={() => handleDecision('Verified')}
                  loading={processing}
                  className="gap-1 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Verify
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-line bg-paper/30">
              <Avatar name={selected.user?.name} src={selected.user?.avatar?.url} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-ink">{selected.user?.name}</h3>
                <p className="text-xs text-ink-muted">{selected.user?.email}</p>
                {selected.user?.phone && <p className="text-xs text-ink-muted">{selected.user?.phone}</p>}
              </div>
              <Badge variant={STATUS_COLORS[selected.verificationStatus] || 'default'}>
                {selected.verificationStatus}
              </Badge>
            </div>

            {/* Bar Council Records */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block uppercase tracking-wider">
                  Bar Council Enrollment Number
                </span>
                <span className="font-mono font-bold text-ink mt-0.5 block text-sm">
                  {selected.barCouncilNumber || 'Not provided'}
                </span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block uppercase tracking-wider">
                  State Bar Council Jurisdiction
                </span>
                <span className="font-bold text-ink mt-0.5 block text-sm">
                  {selected.barCouncilState || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Bio & Details */}
            {selected.bio && (
              <div>
                <span className="text-xs font-bold text-ink block mb-1">Advocate Bio / Statement:</span>
                <div className="panel p-3 text-xs text-ink leading-relaxed bg-paper/20 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {selected.bio}
                </div>
              </div>
            )}

            {/* Rejection / Review Notes */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-ink">
                Administrative Notes & Decision Feedback:
              </label>
              <textarea
                rows={3}
                placeholder="Required if rejecting: Provide reason or instructions for the advocate to correct their credentials..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-base text-xs resize-none"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-ink-muted block w-full">Quick Preset Templates:</span>
                {REJECTION_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNotes(p)}
                    className="text-[10px] border border-line bg-paper/60 hover:bg-paper text-ink-muted hover:text-ink px-2 py-0.5 rounded transition-colors"
                  >
                    {p.slice(0, 42)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
