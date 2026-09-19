import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { Scale } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = { Opened: 'primary', 'In Progress': 'info', Hearing: 'warning', Resolved: 'success', Closed: 'default' };
const STATUSES = ['', 'Opened', 'In Progress', 'Hearing', 'Resolved', 'Closed'];

export default function AdminCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminService.getCases({ status: filter, limit: 50 }).then((d) => {
      setCases(d.cases || []);
      setTotal(d.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">All Cases</h1>
        <p className="text-ink-soft mt-1">{total} total cases on the platform</p>
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
            <thead><tr><th>Case</th><th>Client</th><th>Advocate</th><th>Practice Area</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c._id}>
                  <td><div><p className="font-medium text-sm">{c.title}</p><p className="text-xs text-ink-muted">#{c.caseId}</p></div></td>
                  <td><div className="flex items-center gap-2"><Avatar name={c.client?.name} size="xs" /><span className="text-sm">{c.client?.name}</span></div></td>
                  <td className="text-sm">{c.advocate?.name}</td>
                  <td className="text-sm text-ink-muted">{c.practiceArea}</td>
                  <td><Badge variant={STATUS_COLORS[c.status] || 'default'}>{c.status}</Badge></td>
                  <td className="text-ink-muted">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {cases.length === 0 && <div className="p-10 text-center text-ink-muted">No cases found</div>}
        </div>
      )}
    </div>
  );
}
