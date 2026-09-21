import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import {
  ScrollText,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  X,
  Clock,
  Shield,
  Laptop,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  { id: '', label: 'All Activities' },
  { id: 'auth', label: 'Authentication' },
  { id: 'verification', label: 'Verification' },
  { id: 'badge', label: 'Badges' },
  { id: 'settings', label: 'Settings' },
  { id: 'user', label: 'User Admin' },
];

function getActionColor(action = '') {
  const act = action.toLowerCase();
  if (act.includes('delete') || act.includes('suspend') || act.includes('reject') || act.includes('revoke')) {
    return 'danger';
  }
  if (act.includes('verify') || act.includes('create') || act.includes('grant') || act.includes('approved')) {
    return 'success';
  }
  if (act.includes('update') || act.includes('edit') || act.includes('settings')) {
    return 'warning';
  }
  if (act.includes('login') || act.includes('auth')) {
    return 'chamber';
  }
  return 'info';
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs({
        limit: 100,
        action: selectedCategory || undefined,
        search: search.trim() || undefined,
      });
      setLogs(data.logs || []);
      setTotal(data.total || (data.logs || []).length);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExport = () => {
    if (!logs.length) return;
    const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Action', 'Entity Type', 'Entity ID', 'IP', 'Metadata'];
    const rows = logs.map((l) => [
      format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      `"${l.actor?.name || 'System'}"`,
      `"${l.actor?.email || 'N/A'}"`,
      `"${l.action || ''}"`,
      `"${l.entityType || ''}"`,
      `"${l.entityId || ''}"`,
      `"${l.ip || ''}"`,
      `"${JSON.stringify(l.metadata || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-chamber-700" />
            Audit Trail & Activity Logs
          </h1>
          <p className="text-ink-soft text-sm mt-0.5">
            Immutable security log tracking administrator actions, authentication events, and platform modifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchLogs} loading={loading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'border-chamber-600 bg-chamber-600 text-white shadow-sm'
                  : 'border-line bg-white text-ink-muted hover:border-chamber-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by action, actor, entity, or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10 text-sm py-2"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setTimeout(fetchLogs, 50);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Logs Table */}
      {loading ? (
        <SkeletonTable />
      ) : logs.length === 0 ? (
        <div className="panel p-12 text-center">
          <ScrollText className="mx-auto h-12 w-12 text-ink-muted mb-4 opacity-60" />
          <p className="text-lg font-semibold text-ink">No audit logs found</p>
          <p className="text-sm text-ink-muted mt-1">
            No events match your current filter or search criteria.
          </p>
          {(search || selectedCategory) && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="panel overflow-x-auto shadow-sm">
          <div className="p-3 bg-paper/50 border-b border-line flex items-center justify-between text-xs text-ink-muted">
            <span>Showing <strong>{logs.length}</strong> of <strong>{total}</strong> recorded events</span>
            <span>Click any event to inspect full metadata payload</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target Entity</th>
                <th>Origin IP</th>
                <th>Metadata Preview</th>
                <th className="text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const color = getActionColor(log.action);
                return (
                  <tr
                    key={log._id}
                    className="hover:bg-paper/60 cursor-pointer transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="whitespace-nowrap">
                      <div className="text-xs font-semibold text-ink">
                        {format(new Date(log.createdAt), 'MMM d, yyyy')}
                      </div>
                      <div className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.createdAt), 'HH:mm:ss')} (
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })})
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={log.actor?.name || 'System'} size="xs" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">
                            {log.actor?.name || 'System'}
                          </p>
                          <p className="text-[11px] text-ink-muted truncate">
                            {log.actor?.email || 'automated'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={color} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td>
                      {log.entityType ? (
                        <div>
                          <span className="text-xs font-semibold text-ink uppercase tracking-wider block">
                            {log.entityType}
                          </span>
                          <span className="text-[11px] font-mono text-ink-muted">
                            {log.entityId ? `${log.entityId.slice(0, 8)}...` : '—'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs font-mono text-ink-soft">
                        {log.ip || '127.0.0.1'}
                      </span>
                    </td>
                    <td className="max-w-[200px]">
                      <p className="text-xs font-mono text-ink-muted truncate">
                        {log.metadata && Object.keys(log.metadata).length > 0
                          ? JSON.stringify(log.metadata)
                          : 'None'}
                      </p>
                    </td>
                    <td className="text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={getActionColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                  <span className="text-xs font-mono text-ink-muted">
                    ID: {selectedLog._id}
                  </span>
                </div>
                <h3 className="font-bold text-base text-ink mt-1">Audit Event Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-paper transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Actor Information */}
            <div className="p-3.5 bg-paper/60 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-chamber-600" />
                Actor Profile
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-ink-muted block">Name:</span>
                  <span className="font-semibold text-ink">{selectedLog.actor?.name || 'System Actor'}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Role:</span>
                  <span className="font-semibold text-ink capitalize">{selectedLog.actor?.role || 'System'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-ink-muted block">Email:</span>
                  <span className="font-mono text-ink">{selectedLog.actor?.email || 'system@internal.legalconnect'}</span>
                </div>
              </div>
            </div>

            {/* Target and Context */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-paper/40 rounded-xl border border-line">
                <span className="text-ink-muted block font-medium">Target Entity Type:</span>
                <span className="font-semibold text-ink text-sm capitalize">{selectedLog.entityType || 'Platform'}</span>
                {selectedLog.entityId && (
                  <span className="font-mono text-[10px] text-ink-muted block mt-1 break-all">
                    ID: {selectedLog.entityId}
                  </span>
                )}
              </div>
              <div className="p-3 bg-paper/40 rounded-xl border border-line">
                <span className="text-ink-muted block font-medium">Origin Client:</span>
                <span className="font-mono text-ink text-sm block">{selectedLog.ip || 'Localhost'}</span>
                <span className="text-[10px] text-ink-muted line-clamp-1 mt-1" title={selectedLog.userAgent}>
                  {selectedLog.userAgent || 'Antigravity / Web Client'}
                </span>
              </div>
            </div>

            {/* Exact Timestamp */}
            <div className="flex items-center justify-between text-xs px-2 text-ink-muted">
              <span>Event Timestamp:</span>
              <span className="font-semibold text-ink">
                {format(new Date(selectedLog.createdAt), 'EEEE, MMMM d, yyyy · h:mm:ss a')}
              </span>
            </div>

            {/* Raw JSON Payload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink flex items-center justify-between">
                <span>Payload & Metadata</span>
                <span className="text-[11px] font-normal text-ink-muted">JSON format</span>
              </label>
              <pre className="bg-ink text-paper p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 border-t border-line flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
