import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import VerifiedBadge from '../../components/ui/VerifiedBadge.jsx';
import { Search, MapPin, Star, IndianRupee, ShieldCheck, Eye, ExternalLink, Award, Clock } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

const VERIFICATION_STATUSES = ['', 'Verified', 'Pending', 'Under Review', 'Rejected', 'Suspended'];
const STATUS_COLORS = {
  Verified: 'success',
  Pending: 'warning',
  'Under Review': 'info',
  Rejected: 'danger',
  Suspended: 'danger',
};

export default function AdminAdvocates() {
  const toast = useToast();
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (statusFilter) params.verificationStatus = statusFilter;
      const data = await adminService.getAdvocates(params);
      setAdvocates(data.advocates || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load advocates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleSuspend = async () => {
    try {
      await adminService.updateVerification(confirm.userId, { status: 'Suspended' });
      toast.success('Advocate status updated to Suspended');
      setConfirm(null);
      load();
    } catch {
      toast.error('Failed to suspend advocate');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-chamber-700" /> Platform Advocates Directory
        </h1>
        <p className="text-ink-soft text-sm mt-0.5">{total} verified and registered advocates</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search advocate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-44 text-sm"
        >
          {VERIFICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || 'All Verification Statuses'}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="panel overflow-hidden border border-line">
          <table className="data-table">
            <thead>
              <tr>
                <th>Advocate</th>
                <th>Verification</th>
                <th>Bar Council ID</th>
                <th>Experience</th>
                <th>Fee</th>
                <th>Rating</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {advocates.map((a) => (
                <tr key={a._id} className="hover:bg-paper/40 transition-colors">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.user?.name} src={a.user?.avatar?.url} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-xs text-ink">{a.user?.name || 'Advocate'}</p>
                          {a.verificationStatus === 'Verified' && <VerifiedBadge />}
                        </div>
                        <p className="text-[11px] text-ink-muted">{a.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={STATUS_COLORS[a.verificationStatus] || 'default'} size="xs">
                      {a.verificationStatus}
                    </Badge>
                  </td>
                  <td className="text-xs text-ink-muted font-mono">{a.barCouncilNumber || '—'}</td>
                  <td className="text-xs text-ink">{a.experienceYears ?? 0} yrs</td>
                  <td className="text-xs font-bold text-ink">₹{(a.consultationFee || 0).toLocaleString()}</td>
                  <td>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3.5 w-3.5 text-brass-500 fill-brass-500" />
                      <span className="font-semibold">{a.avgRating?.toFixed(1) || '—'}</span>
                    </div>
                  </td>
                  <td className="text-xs text-ink-muted">
                    {format(new Date(a.createdAt || a.user?.createdAt || Date.now()), 'MMM d, yyyy')}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => setSelected(a)}
                        className="gap-1 py-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Button>
                      {a.verificationStatus !== 'Suspended' && (
                        <button
                          type="button"
                          onClick={() => setConfirm({ userId: a.user?._id, name: a.user?.name })}
                          className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline ml-1"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {advocates.length === 0 && (
            <div className="p-10 text-center text-ink-muted text-sm">No advocates found matching criteria</div>
          )}
        </div>
      )}

      {/* Advocate Details Modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Advocate Profile — ${selected.user?.name}`}
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Link
                to={`/client/advocates/${selected._id || selected.user?._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-chamber-700 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                View Public Listing <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-line bg-paper/20">
              <Avatar name={selected.user?.name} src={selected.user?.avatar?.url} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-ink">{selected.user?.name}</h3>
                  <Badge variant={STATUS_COLORS[selected.verificationStatus] || 'default'} size="xs">
                    {selected.verificationStatus}
                  </Badge>
                </div>
                <p className="text-xs text-ink-muted">{selected.user?.email}</p>
                {selected.user?.phone && <p className="text-xs text-ink-muted">{selected.user?.phone}</p>}
              </div>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Bar Council Number</span>
                <span className="font-mono font-bold text-ink mt-0.5 block">{selected.barCouncilNumber || 'Pending'}</span>
                <span className="text-[11px] text-ink-muted">{selected.barCouncilState || 'State Bar'}</span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Experience & Rating</span>
                <span className="font-bold text-ink mt-0.5 block">{selected.experienceYears || 0} Years Experience</span>
                <span className="text-[11px] text-brass-700 font-semibold">★ {selected.avgRating?.toFixed(1) || 'No reviews'}</span>
              </div>
            </div>

            {selected.headline && (
              <div>
                <span className="text-xs font-bold text-ink block mb-0.5">Professional Headline:</span>
                <p className="text-xs text-ink-soft">{selected.headline}</p>
              </div>
            )}

            {selected.bio && (
              <div>
                <span className="text-xs font-bold text-ink block mb-0.5">Biography & Background:</span>
                <div className="panel p-3 text-xs text-ink leading-relaxed bg-paper/20 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selected.bio}
                </div>
              </div>
            )}

            {selected.practiceAreas?.length > 0 && (
              <div>
                <span className="text-xs font-bold text-ink block mb-1">Practice Areas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selected.practiceAreas.map((area) => (
                    <span key={area} className="rounded-full bg-chamber-50 border border-chamber-200 text-chamber-800 text-[10px] font-semibold px-2.5 py-0.5">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleSuspend}
        title="Suspend Advocate Access"
        description={`Are you sure you want to suspend ${confirm?.name}'s advocate privileges? They will not be able to accept consultations or create cases.`}
        confirmText="Yes, Suspend"
        variant="danger"
      />
    </div>
  );
}
