import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = { Pending: 'warning', Confirmed: 'success', Completed: 'default', Cancelled: 'danger', Rejected: 'danger' };
const STATUSES = ['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminService.getConsultations({ status: filter, limit: 50 }).then((d) => {
      setConsultations(d.consultations || []);
      setTotal(d.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">All Consultations</h1>
        <p className="text-ink-soft mt-1">{total} total consultations</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${filter === s ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line bg-white text-ink-muted hover:border-chamber-300'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>Client</th><th>Advocate</th><th>Date</th><th>Mode</th><th>Fee</th><th>Status</th></tr></thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c._id}>
                  <td><div className="flex items-center gap-2"><Avatar name={c.client?.name} size="xs" /><span className="text-sm">{c.client?.name}</span></div></td>
                  <td className="text-sm">{c.advocate?.name}</td>
                  <td className="text-ink-muted">{format(new Date(c.date), 'MMM d, yyyy')} {c.timeSlot}</td>
                  <td className="capitalize text-ink-muted">{c.mode}</td>
                  <td>₹{c.payment?.amount?.toLocaleString() || '—'}</td>
                  <td><Badge variant={STATUS_COLORS[c.status] || 'default'}>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {consultations.length === 0 && <div className="p-10 text-center text-ink-muted">No consultations found</div>}
        </div>
      )}
    </div>
  );
}
