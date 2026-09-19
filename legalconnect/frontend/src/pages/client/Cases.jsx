import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ChevronRight } from 'lucide-react';
import { caseService } from '../../services/caseService.js';
import Badge from '../../components/ui/Badge.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { format } from 'date-fns';
import Avatar from '../../components/ui/Avatar.jsx';

const STATUS_COLORS = { Opened: 'primary', 'In Progress': 'info', Hearing: 'warning', Resolved: 'success', Closed: 'default' };
const STATUSES = ['', 'Opened', 'In Progress', 'Hearing', 'Resolved', 'Closed'];

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    caseService.list({ status: statusFilter, limit: 20 }).then((d) => {
      setCases(d.cases || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">My Cases</h1>
        <p className="text-ink-soft mt-1">Track the progress of all your legal cases</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === s ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line bg-white text-ink-muted hover:border-chamber-300'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <SkeletonTable /> : cases.length === 0 ? (
        <div className="panel p-12 text-center">
          <Scale className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No cases yet</p>
          <p className="text-sm text-ink-muted mt-1">Cases are created by your advocate after a completed consultation.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {cases.map((c) => (
            <Link key={c._id} to={`/client/cases/${c._id}`} className="flex items-center gap-4 p-4 hover:bg-paper transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chamber-50">
                <Scale className="h-5 w-5 text-chamber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink truncate">{c.title}</p>
                  <span className="text-xs text-ink-muted hidden sm:inline">#{c.caseId}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted mt-0.5">
                  <span>{c.practiceArea}</span>
                  <span>·</span>
                  <span>Opened {format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Avatar name={c.advocate?.name} size="xs" />
                    <span>{c.advocate?.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_COLORS[c.status] || 'default'}>{c.status}</Badge>
                <ChevronRight className="h-4 w-4 text-ink-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
