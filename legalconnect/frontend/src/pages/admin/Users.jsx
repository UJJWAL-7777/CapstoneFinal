import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { Search, Users, ShieldBan, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

const ROLES = ['', 'client', 'advocate', 'admin'];
const STATUSES = ['', 'active', 'suspended'];
const STATUS_COLORS = { active: 'success', suspended: 'danger', pending: 'warning' };

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '', search: '', page: 1 });
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const data = await adminService.getUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const handleStatusChange = async () => {
    try {
      await adminService.updateUserStatus(confirm.userId, confirm.newStatus);
      toast.success(`User ${confirm.newStatus}`);
      setConfirm(null);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Users</h1>
        <p className="text-ink-soft mt-1">{total.toLocaleString()} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input type="text" placeholder="Search name or email..." value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))} className="input-base pl-10" />
        </div>
        <select value={filters.role} onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value, page: 1 }))} className="input-base w-36">
          {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r || 'All roles'}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))} className="input-base w-36">
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s || 'All statuses'}</option>)}
        </select>
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.avatar?.url} size="sm" />
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-ink-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><Badge variant="default" className="capitalize">{u.role}</Badge></td>
                  <td><Badge variant={STATUS_COLORS[u.status] || 'default'}>{u.status}</Badge></td>
                  <td className="text-ink-muted">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    {u.status === 'active' ? (
                      <button onClick={() => setConfirm({ userId: u._id, newStatus: 'suspended', name: u.name })} className="text-xs text-danger-500 hover:underline flex items-center gap-1">
                        <ShieldBan className="h-3.5 w-3.5" /> Suspend
                      </button>
                    ) : (
                      <button onClick={() => setConfirm({ userId: u._id, newStatus: 'active', name: u.name })} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="p-10 text-center text-ink-muted">No users found</div>}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleStatusChange}
        title={`${confirm?.newStatus === 'suspended' ? 'Suspend' : 'Activate'} User`}
        message={`Are you sure you want to ${confirm?.newStatus === 'suspended' ? 'suspend' : 'reactivate'} ${confirm?.name}?`}
        confirmLabel={confirm?.newStatus === 'suspended' ? 'Suspend' : 'Activate'}
        danger={confirm?.newStatus === 'suspended'}
      />
    </div>
  );
}
