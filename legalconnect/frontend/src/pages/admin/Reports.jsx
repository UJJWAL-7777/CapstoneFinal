import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../../components/ui/Modal.jsx';

const STATUSES = ['', 'Pending', 'Under Review', 'Resolved', 'Rejected'];
const STATUS_COLORS = { Pending: 'warning', 'Under Review': 'info', Resolved: 'success', Rejected: 'default' };

export default function AdminReports() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: 'Resolved', adminNotes: '', actionTaken: 'warned' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReports({ status: filter, limit: 50 });
      setReports(data.reports || data || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await adminService.updateReport(selected._id, form);
      toast.success('Report updated');
      setSelected(null);
      load();
    } catch { toast.error('Failed to update report'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Reports</h1>
        <p className="text-ink-soft mt-1">Review user misconduct and complaint reports</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${filter === s ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line bg-white text-ink-muted hover:border-chamber-300'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <SkeletonTable /> : reports.length === 0 ? (
        <div className="panel p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No reports</p>
          <p className="text-sm text-ink-muted mt-1">No reports match the selected filter.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {reports.map((r) => (
            <div key={r._id} className="flex items-center gap-4 p-4">
              <AlertCircle className="h-5 w-5 text-danger-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{r.type}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  <strong>{r.reporter?.name}</strong> reported <strong>{r.reportedUser?.name}</strong> · {format(new Date(r.createdAt), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-ink-soft mt-0.5 line-clamp-1">{r.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_COLORS[r.status] || 'default'}>{r.status}</Badge>
                <Button size="sm" onClick={() => {
                  setSelected(r);
                  setForm({ status: r.status || 'Resolved', adminNotes: r.adminNotes || '', actionTaken: r.actionTaken || 'warned' });
                }}>
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleUpdate} loading={saving}>Update Report</Button>
          </>
        }>
        {selected && (
          <div className="space-y-4">
            <div className="bg-paper rounded-xl p-4 text-sm space-y-1">
              <p className="font-semibold">{selected.type}</p>
              <p className="text-ink-muted">{selected.description}</p>
              <div className="flex gap-4 mt-2 text-xs text-ink-muted">
                <span>Reporter: <strong>{selected.reporter?.name}</strong></span>
                <span>Reported: <strong>{selected.reportedUser?.name}</strong></span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="input-base">
                {['Pending', 'Under Review', 'Resolved', 'Rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Action Taken</label>
              <select value={form.actionTaken} onChange={(e) => setForm((p) => ({ ...p, actionTaken: e.target.value }))} className="input-base">
                <option value="no_action">No Action</option>
                <option value="warned">Warned User</option>
                <option value="suspended">Suspended User</option>
                <option value="removed">Removed User</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Admin Notes</label>
              <textarea rows={3} value={form.adminNotes} onChange={(e) => setForm((p) => ({ ...p, adminNotes: e.target.value }))} className="input-base resize-none w-full" placeholder="Notes visible to admin team..." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
