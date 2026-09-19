import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { ShieldCheck, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../../components/ui/Modal.jsx';

const STATUSES = ['Pending,Under Review', 'Verified', 'Rejected', 'Suspended'];
const STATUS_COLORS = { Verified: 'success', Pending: 'warning', 'Under Review': 'info', Rejected: 'danger', Suspended: 'danger' };

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
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleDecision = async (status) => {
    setProcessing(true);
    try {
      await adminService.updateVerification(selected.user._id, { status, notes });
      toast.success(`Advocate ${status}`);
      setSelected(null);
      setNotes('');
      load();
    } catch { toast.error('Action failed'); }
    finally { setProcessing(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Advocate Verification</h1>
        <p className="text-ink-soft mt-1">Review and approve advocate registration applications</p>
      </div>

      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${filter === s ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line bg-white text-ink-muted hover:border-chamber-300'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <SkeletonTable /> : profiles.length === 0 ? (
        <div className="panel p-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No applications in this queue</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {profiles.map((p) => (
            <div key={p._id} className="flex items-center gap-4 p-4">
              <Avatar name={p.user?.name} src={p.user?.avatar?.url} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{p.user?.name}</p>
                <p className="text-sm text-ink-muted">{p.user?.email}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-ink-muted">
                  {p.location?.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location.city}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.experienceYears} yrs exp</span>
                  <span>Applied {format(new Date(p.user?.createdAt || p.createdAt), 'MMM d, yyyy')}</span>
                </div>
                {p.practiceAreas?.length > 0 && (
                  <p className="text-xs text-chamber-600 mt-1">{p.practiceAreas.slice(0, 3).join(', ')}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_COLORS[p.verificationStatus] || 'default'}>{p.verificationStatus}</Badge>
                <Button size="sm" onClick={() => setSelected(p)}>Review</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Application" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)} disabled={processing}>Close</Button>
            <Button variant="danger" onClick={() => handleDecision('Rejected')} loading={processing}>Reject</Button>
            <Button variant="primary" onClick={() => handleDecision('Under Review')} loading={processing}>Under Review</Button>
            <Button variant="brass" onClick={() => handleDecision('Verified')} loading={processing}>
              <ShieldCheck className="h-4 w-4" /> Verify
            </Button>
          </>
        }>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.user?.name} size="lg" />
              <div>
                <p className="font-semibold">{selected.user?.name}</p>
                <p className="text-sm text-ink-muted">{selected.user?.email}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-ink-muted">Experience</dt><dd>{selected.experienceYears} years</dd></div>
              <div><dt className="text-ink-muted">Fee</dt><dd>₹{selected.consultationFee?.toLocaleString()}</dd></div>
              <div className="col-span-2"><dt className="text-ink-muted">Practice Areas</dt><dd>{selected.practiceAreas?.join(', ')}</dd></div>
              {selected.barCouncilId && <div className="col-span-2"><dt className="text-ink-muted">Bar Council ID</dt><dd>{selected.barCouncilId}</dd></div>}
            </dl>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Admin Notes (sent to advocate)</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input-base resize-none w-full" placeholder="Reason for approval/rejection..." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
