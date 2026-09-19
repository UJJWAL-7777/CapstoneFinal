import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import VerifiedBadge from '../../components/ui/VerifiedBadge.jsx';
import { Search, MapPin, Star, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

const VERIFICATION_STATUSES = ['', 'Verified', 'Pending', 'Under Review', 'Rejected', 'Suspended'];
const STATUS_COLORS = { Verified: 'success', Pending: 'warning', 'Under Review': 'info', Rejected: 'danger', Suspended: 'danger' };

export default function AdminAdvocates() {
  const toast = useToast();
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (statusFilter) params.verificationStatus = statusFilter;
      const data = await adminService.getAdvocates(params);
      setAdvocates(data.advocates || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleSuspend = async () => {
    try {
      await adminService.updateVerification(confirm.userId, { status: 'Suspended' });
      toast.success('Advocate suspended');
      setConfirm(null);
      load();
    } catch { toast.error('Failed to suspend'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Advocates</h1>
        <p className="text-ink-soft mt-1">{total} advocates on the platform</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input type="text" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-base pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base w-44">
          {VERIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>Advocate</th><th>Verification</th><th>Exp</th><th>Fee</th><th>Rating</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {advocates.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={a.user?.name} size="sm" />
                      <div>
                        <p className="font-medium text-sm">{a.user?.name}</p>
                        <p className="text-xs text-ink-muted">{a.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><Badge variant={STATUS_COLORS[a.verificationStatus] || 'default'}>{a.verificationStatus}</Badge></td>
                  <td className="text-sm">{a.experienceYears} yrs</td>
                  <td className="text-sm">₹{a.consultationFee?.toLocaleString()}</td>
                  <td><div className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 text-brass-500" />{a.avgRating?.toFixed(1) || '—'}</div></td>
                  <td className="text-ink-muted">{format(new Date(a.createdAt || a.user?.createdAt || new Date()), 'MMM d, yyyy')}</td>
                  <td>
                    {a.verificationStatus !== 'Suspended' && (
                      <button onClick={() => setConfirm({ userId: a.user?._id, name: a.user?.name })} className="text-xs text-danger-500 hover:underline">Suspend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {advocates.length === 0 && <div className="p-10 text-center text-ink-muted">No advocates found</div>}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleSuspend}
        title="Suspend Advocate"
        message={`Are you sure you want to suspend ${confirm?.name}? They will lose access to the platform.`}
        confirmLabel="Suspend"
        danger
      />
    </div>
  );
}
