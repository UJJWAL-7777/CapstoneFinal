import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { ScrollText, Search } from 'lucide-react';
import { format } from 'date-fns';

const ACTION_COLORS = { create: 'success', update: 'info', delete: 'danger', login: 'default', suspend: 'warning', verify: 'success' };

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getAuditLogs({ limit: 100, search }).then((d) => setLogs(d.logs || [])).catch(() => {}).finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Audit Logs</h1>
        <p className="text-ink-soft mt-1">Track all admin and platform actions</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
        <input type="text" placeholder="Filter logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-base pl-10" />
      </div>

      {loading ? <SkeletonTable /> : logs.length === 0 ? (
        <div className="panel p-12 text-center">
          <ScrollText className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No audit logs</p>
        </div>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>Actor</th><th>Action</th><th>Target</th><th>Details</th><th>Timestamp</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="text-sm font-medium">{log.actor?.name || 'System'}</td>
                  <td>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize 
                      ${log.action?.includes('delete') || log.action?.includes('suspend') ? 'bg-red-50 text-red-700' : 
                        log.action?.includes('create') || log.action?.includes('verify') ? 'bg-emerald-50 text-emerald-700' : 
                        'bg-blue-50 text-blue-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="text-sm capitalize text-ink-muted">{log.targetType}: {log.targetId}</td>
                  <td className="text-xs text-ink-muted max-w-xs truncate">{log.details ? JSON.stringify(log.details) : '—'}</td>
                  <td className="text-ink-muted text-sm">{format(new Date(log.createdAt), 'MMM d, h:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
