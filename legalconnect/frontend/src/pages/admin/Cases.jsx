import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { Scale, Search, Eye, ExternalLink, Building, Gavel, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  Opened: 'primary',
  'In Progress': 'info',
  Hearing: 'warning',
  Resolved: 'success',
  Closed: 'default',
};

const STATUSES = ['', 'Opened', 'In Progress', 'Hearing', 'Resolved', 'Closed'];

export default function AdminCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  const loadData = () => {
    setLoading(true);
    adminService
      .getCases({ status: filter, search, limit: 100 })
      .then((d) => {
        setCases(d.cases || []);
        setTotal(d.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [filter, search]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <Scale className="h-6 w-6 text-chamber-700" /> Platform Legal Cases & Disputes
        </h1>
        <p className="text-ink-soft text-sm mt-0.5">
          {total} total active and resolved matters across court jurisdictions
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {STATUSES.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${
                filter === s
                  ? 'border-chamber-600 bg-chamber-600 text-white shadow-sm'
                  : 'border-line bg-white text-ink-muted hover:border-chamber-300'
              }`}
            >
              {s || 'All Statuses'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
          <input
            type="text"
            placeholder="Search title, case ID, or court..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-8 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable />
      ) : cases.length === 0 ? (
        <div className="panel p-12 text-center space-y-2">
          <Scale className="mx-auto h-8 w-8 text-ink-muted opacity-40" />
          <p className="text-sm font-semibold text-ink">No cases match criteria</p>
          <p className="text-xs text-ink-muted">Try clearing your search query or status filter.</p>
        </div>
      ) : (
        <div className="panel overflow-hidden border border-line">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case Matter</th>
                <th>Client</th>
                <th>Advocate</th>
                <th>Practice Area</th>
                <th>Court Jurisdiction</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c._id} className="hover:bg-paper/40 transition-colors">
                  <td>
                    <div>
                      <p className="font-bold text-xs text-ink truncate max-w-[200px]">{c.title}</p>
                      <p className="text-[10px] text-chamber-700 font-mono font-semibold">{c.caseId || '—'}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={c.client?.name} src={c.client?.avatar?.url} size="xs" />
                      <span className="text-xs font-semibold text-ink truncate max-w-[120px]">
                        {c.client?.name || 'Client'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={c.advocate?.name} src={c.advocate?.avatar?.url} size="xs" />
                      <span className="text-xs font-semibold text-ink truncate max-w-[120px]">
                        {c.advocate?.name || 'Advocate'}
                      </span>
                    </div>
                  </td>
                  <td className="text-xs text-ink-soft truncate max-w-[130px]">
                    {c.practiceArea || 'General'}
                  </td>
                  <td className="text-xs text-ink-muted truncate max-w-[150px]">
                    {c.courtName || 'District Court'}
                  </td>
                  <td>
                    <Badge variant={STATUS_COLORS[c.status] || 'default'} size="xs">
                      {c.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => setSelected(c)}
                      className="gap-1 py-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Case Details Modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Case Matter — ${selected.caseId || selected.title}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Link
                to={`/advocate/cases/${selected._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-chamber-700 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                Inspect Full Workspace <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-ink">{selected.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={STATUS_COLORS[selected.status] || 'default'} size="xs">
                  {selected.status}
                </Badge>
                <Badge variant="default" size="xs" className="uppercase font-semibold">
                  Priority: {selected.priority || 'medium'}
                </Badge>
                <span className="text-xs text-ink-muted font-mono">{selected.caseId}</span>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-line bg-paper/30">
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Client (Petitioner)</span>
                <p className="text-xs font-bold text-ink mt-0.5">{selected.client?.name}</p>
                <p className="text-[11px] text-ink-muted">{selected.client?.email}</p>
                {selected.client?.phone && <p className="text-[11px] text-ink-muted">{selected.client?.phone}</p>}
              </div>
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Assigned Advocate</span>
                <p className="text-xs font-bold text-ink mt-0.5">{selected.advocate?.name}</p>
                <p className="text-[11px] text-ink-muted">{selected.advocate?.email}</p>
                {selected.advocate?.phone && <p className="text-[11px] text-ink-muted">{selected.advocate?.phone}</p>}
              </div>
            </div>

            {/* Court Jurisdictional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Court Jurisdiction</span>
                <span className="font-bold text-ink mt-0.5 block">{selected.courtName || 'Court of Record'}</span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Court Filing Number</span>
                <span className="font-mono font-bold text-ink mt-0.5 block">{selected.caseNumber || 'Pending Filing'}</span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Opposing Party</span>
                <span className="font-bold text-ink mt-0.5 block">{selected.opposingParty || 'Private Dispute'}</span>
              </div>
            </div>

            {/* Matter Description */}
            <div>
              <span className="text-xs font-bold text-ink block mb-1">Matter Case Summary & Grounds:</span>
              <div className="panel p-3 text-xs text-ink leading-relaxed bg-paper/20 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selected.description || 'No case description recorded.'}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
