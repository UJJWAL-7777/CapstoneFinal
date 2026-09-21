import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { Search, Users, ShieldBan, ShieldCheck, Eye, Mail, Phone, Calendar, Scale, CreditCard } from 'lucide-react';
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
  const [pages, setPages] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [inspectUser, setInspectUser] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const data = await adminService.getUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 200);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleStatusChange = async () => {
    try {
      await adminService.updateUserStatus(confirm.userId, confirm.newStatus);
      toast.success(`User status changed to ${confirm.newStatus}`);
      setConfirm(null);
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleInspect = async (user) => {
    setInspectLoading(true);
    try {
      const details = await adminService.getUserDetails(user._id);
      setInspectUser(details);
    } catch (err) {
      console.error('Failed to get user details:', err);
      toast.error('Failed to fetch user details');
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <Users className="h-6 w-6 text-chamber-700" /> Platform Users Management
        </h1>
        <p className="text-ink-soft text-sm mt-0.5">{total.toLocaleString()} registered accounts on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="input-base pl-10 text-sm"
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value, page: 1 }))}
          className="input-base w-36 text-sm"
        >
          {ROLES.map((r) => (
            <option key={r} value={r} className="capitalize">
              {r ? `${r.charAt(0).toUpperCase() + r.slice(1)}s` : 'All Roles'}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
          className="input-base w-36 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s ? `${s.charAt(0).toUpperCase() + s.slice(1)}` : 'All Statuses'}
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
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-paper/40 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.avatar?.url} size="sm" />
                      <div>
                        <p className="font-semibold text-xs text-ink">{u.name}</p>
                        <p className="text-[11px] text-ink-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant="default" size="xs" className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={STATUS_COLORS[u.status] || 'default'} size="xs">
                      {u.status}
                    </Badge>
                  </td>
                  <td className="text-xs text-ink-muted">
                    {format(new Date(u.createdAt || Date.now()), 'MMM d, yyyy')}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleInspect(u)}
                        className="gap-1 py-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect
                      </Button>
                      {u.role !== 'admin' && (
                        u.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({ userId: u._id, newStatus: 'suspended', name: u.name })
                            }
                            className="text-xs text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 hover:underline ml-1"
                          >
                            <ShieldBan className="h-3.5 w-3.5" /> Suspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({ userId: u._id, newStatus: 'active', name: u.name })
                            }
                            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center gap-1 hover:underline ml-1"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Activate
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="p-10 text-center text-ink-muted text-sm">No users found matching query</div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between p-3.5 border-t border-line text-xs">
              <span className="text-ink-muted">
                Page {filters.page} of {pages} ({total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={filters.page >= pages}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleStatusChange}
        title={confirm?.newStatus === 'suspended' ? 'Suspend Account' : 'Reactivate Account'}
        description={`Are you sure you want to ${confirm?.newStatus === 'suspended' ? 'suspend' : 'reactivate'} ${confirm?.name}'s account access?`}
        confirmText={confirm?.newStatus === 'suspended' ? 'Yes, Suspend' : 'Yes, Activate'}
        variant={confirm?.newStatus === 'suspended' ? 'danger' : 'primary'}
      />

      {/* User Inspection Modal */}
      {inspectUser && (
        <Modal
          isOpen={!!inspectUser}
          onClose={() => setInspectUser(null)}
          title={`User Record — ${inspectUser.user?.name}`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setInspectUser(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-line bg-paper/20">
              <Avatar name={inspectUser.user?.name} src={inspectUser.user?.avatar?.url} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-ink">{inspectUser.user?.name}</h3>
                  <Badge variant={STATUS_COLORS[inspectUser.user?.status] || 'default'} size="xs">
                    {inspectUser.user?.status}
                  </Badge>
                  <Badge variant="default" size="xs" className="capitalize font-semibold">
                    {inspectUser.user?.role}
                  </Badge>
                </div>
                <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-2">
                  <Mail className="h-3 w-3 inline" /> {inspectUser.user?.email}
                  {inspectUser.user?.phone && (
                    <>
                      <span>•</span>
                      <span><Phone className="h-3 w-3 inline" /> {inspectUser.user?.phone}</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  Member since {format(new Date(inspectUser.user?.createdAt || Date.now()), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Account Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="panel p-3">
                <Calendar className="h-4 w-4 text-chamber-700 mx-auto mb-1" />
                <p className="text-base font-bold text-ink">{inspectUser.stats?.totalConsultations || 0}</p>
                <p className="text-[11px] text-ink-muted">Consultations</p>
              </div>
              <div className="panel p-3">
                <Scale className="h-4 w-4 text-brass-600 mx-auto mb-1" />
                <p className="text-base font-bold text-ink">{inspectUser.stats?.totalCases || 0}</p>
                <p className="text-[11px] text-ink-muted">Court Matters</p>
              </div>
              <div className="panel p-3">
                <CreditCard className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-base font-bold text-ink">{inspectUser.stats?.totalPayments || 0}</p>
                <p className="text-[11px] text-ink-muted">Transactions</p>
              </div>
            </div>

            {/* Advocate Profile Details if advocate */}
            {inspectUser.profile && (
              <div className="panel p-3.5 space-y-2 text-xs">
                <span className="font-bold text-ink block">Advocate Practice Profile:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-muted">
                  <p>Bar Council: <strong className="text-ink">{inspectUser.profile.barCouncilNumber || 'N/A'}</strong></p>
                  <p>State: <strong className="text-ink">{inspectUser.profile.barCouncilState || 'N/A'}</strong></p>
                  <p>Experience: <strong className="text-ink">{inspectUser.profile.experienceYears || 0} years</strong></p>
                  <p>Fee: <strong className="text-ink">₹{inspectUser.profile.consultationFee || 0}</strong></p>
                </div>
                {inspectUser.profile.practiceAreas?.length > 0 && (
                  <p className="text-[11px] text-chamber-700">
                    Areas: {inspectUser.profile.practiceAreas.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
