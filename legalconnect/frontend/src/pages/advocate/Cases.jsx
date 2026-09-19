import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ChevronRight, Plus } from 'lucide-react';
import { caseService } from '../../services/caseService.js';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { format } from 'date-fns';

const STATUS_COLORS = { Opened: 'primary', 'In Progress': 'info', Hearing: 'warning', Resolved: 'success', Closed: 'default' };
const STATUSES = ['', 'Opened', 'In Progress', 'Hearing', 'Resolved'];

export default function AdvocateCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    caseService.list({ status: statusFilter, limit: 50 }).then((d) => setCases(d.cases || [])).catch(() => {}).finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Cases</h1>
        <p className="text-ink-soft mt-1">Manage all your active and past cases</p>
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
          <p className="text-lg font-medium">No cases found</p>
          <p className="text-sm text-ink-muted mt-1">Cases are created from completed consultations.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {cases.map((c) => (
            <Link key={c._id} to={`/advocate/cases/${c._id}`} className="flex items-center gap-4 p-4 hover:bg-paper transition-colors">
              <Scale className="h-5 w-5 text-chamber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{c.title}</p>
                  <span className="text-xs text-ink-muted hidden sm:inline">#{c.caseId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5">
                  <Avatar name={c.client?.name} size="xs" />
                  <span>{c.client?.name}</span>
                  <span>·</span>
                  <span>{c.practiceArea}</span>
                  <span>·</span>
                  <span>{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
