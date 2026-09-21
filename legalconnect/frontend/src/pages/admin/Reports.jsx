import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import {
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  UserX,
  FileText,
  Calendar,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../../components/ui/Modal.jsx';

const STATUSES = ['', 'Pending', 'Under Review', 'Resolved', 'Rejected'];
const STATUS_COLORS = {
  Pending: 'warning',
  'Under Review': 'info',
  Resolved: 'success',
  Rejected: 'default',
};

export default function AdminReports() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: 'Resolved', adminNotes: '', actionTaken: 'warned' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReports({ status: filter || undefined, limit: 100 });
      setReports(data.reports || data || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await adminService.updateReport(selected._id, form);
      toast.success('Report updated successfully');
      setSelected(null);
      load();
    } catch {
      toast.error('Failed to update report');
    } finally {
      setSaving(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.type?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.reporter?.name?.toLowerCase().includes(q) ||
      r.reportedUser?.name?.toLowerCase().includes(q)
    );
  });

  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const underReviewCount = reports.filter((r) => r.status === 'Under Review').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-rose-600" />
          User Reports & Dispute Resolution
        </h1>
        <p className="text-ink-soft text-sm mt-0.5">
          Review complaints, ethical violations, and misconduct tickets reported by platform members
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Action"
          value={pendingCount}
          icon={AlertCircle}
          color="danger"
          subtitle="Awaiting triage"
        />
        <StatCard
          title="Under Active Review"
          value={underReviewCount}
          icon={Clock}
          color="warning"
          subtitle="Investigation in progress"
        />
        <StatCard
          title="Resolved Disputes"
          value={resolvedCount}
          icon={CheckCircle2}
          color="success"
          subtitle="Discipline or warning issued"
        />
      </div>

      {/* Controls: Filter Pills and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {STATUSES.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-all ${
                filter === s
                  ? 'border-chamber-600 bg-chamber-600 text-white shadow-sm'
                  : 'border-line bg-white text-ink-muted hover:border-chamber-300'
              }`}
            >
              {s || 'All Reports'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parties, reason..."
            className="input-base pl-9 text-xs py-1.5"
          />
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <SkeletonTable />
      ) : filteredReports.length === 0 ? (
        <div className="panel p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-ink-muted mb-4 opacity-50" />
          <p className="text-lg font-semibold text-ink">No reports found</p>
          <p className="text-sm text-ink-muted mt-1">No dispute tickets match the selected criteria.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line shadow-sm">
          {filteredReports.map((r) => (
            <div
              key={r._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-paper/40 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 shrink-0 mt-0.5">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-ink">{r.type}</span>
                    <Badge variant={STATUS_COLORS[r.status] || 'default'} size="xs">
                      {r.status}
                    </Badge>
                    {r.actionTaken && r.actionTaken !== 'no_action' && (
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 capitalize">
                        {r.actionTaken}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted">
                    Reported by <strong className="text-ink">{r.reporter?.name || 'Anonymous'}</strong> ({r.reporter?.role}) against{' '}
                    <strong className="text-rose-800">{r.reportedUser?.name || 'Unknown User'}</strong> ({r.reportedUser?.role}) ·{' '}
                    {format(new Date(r.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-ink-soft bg-paper/60 p-2 rounded-lg border border-line mt-1 line-clamp-2">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelected(r);
                    setForm({
                      status: r.status || 'Resolved',
                      adminNotes: r.adminNotes || '',
                      actionTaken: r.actionTaken || 'warned',
                    });
                  }}
                >
                  Review Case
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Ticket Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Review Misconduct Complaint"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} loading={saving}>
              Save & Apply Sanction
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            {/* Involved Parties */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-paper/60 rounded-xl border border-line text-xs space-y-1">
                <span className="text-ink-muted block font-medium">Reporting Party:</span>
                <p className="font-semibold text-ink text-sm">{selected.reporter?.name || 'Anonymous'}</p>
                <p className="text-ink-muted">{selected.reporter?.email || 'N/A'}</p>
                <Badge variant="secondary" size="xs" className="capitalize">
                  {selected.reporter?.role || 'User'}
                </Badge>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-xs space-y-1">
                <span className="text-rose-700 block font-medium">Reported Subject:</span>
                <p className="font-semibold text-rose-950 text-sm">{selected.reportedUser?.name || 'Unknown'}</p>
                <p className="text-rose-700">{selected.reportedUser?.email || 'N/A'}</p>
                <Badge variant="danger" size="xs" className="capitalize">
                  {selected.reportedUser?.role || 'User'}
                </Badge>
              </div>
            </div>

            {/* Complaint Detail */}
            <div className="p-3.5 bg-paper rounded-xl border border-line text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Violation Category:</span>
                <span className="font-semibold text-rose-800">{selected.type}</span>
              </div>
              <div>
                <span className="font-bold text-ink block mb-0.5">Narrative:</span>
                <p className="text-ink-soft leading-relaxed bg-white p-2.5 rounded-lg border border-line">
                  {selected.description}
                </p>
              </div>
            </div>

            {/* Administrative Resolution Form */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Ticket Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="input-base text-xs"
                  >
                    {['Pending', 'Under Review', 'Resolved', 'Rejected'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Disciplinary Action</label>
                  <select
                    value={form.actionTaken}
                    onChange={(e) => setForm((p) => ({ ...p, actionTaken: e.target.value }))}
                    className="input-base text-xs"
                  >
                    <option value="no_action">No Action / Dismissed</option>
                    <option value="warned">Formal Warning Issued</option>
                    <option value="suspended">Account Suspended</option>
                    <option value="removed">Account Terminated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Administrative Notes & Findings</label>
                <textarea
                  rows={3}
                  value={form.adminNotes}
                  onChange={(e) => setForm((p) => ({ ...p, adminNotes: e.target.value }))}
                  className="input-base text-xs resize-none w-full"
                  placeholder="Internal audit notes documenting findings, reasons for sanctions, or next steps..."
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
