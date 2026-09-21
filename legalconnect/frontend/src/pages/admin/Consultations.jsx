import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { Calendar, Search, Video, MessageSquare, MapPin, Eye, ExternalLink, IndianRupee, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  Pending: 'warning',
  Confirmed: 'success',
  Completed: 'default',
  Cancelled: 'danger',
  Rejected: 'danger',
};

const STATUSES = ['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  const loadData = () => {
    setLoading(true);
    adminService
      .getConsultations({ status: filter, search, limit: 100 })
      .then((d) => {
        setConsultations(d.consultations || []);
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
          <Calendar className="h-6 w-6 text-chamber-700" /> Platform Consultations Overview
        </h1>
        <p className="text-ink-soft text-sm mt-0.5">
          {total} total consultations booked across all advocates and clients
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
            placeholder="Search client, advocate, or issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-8 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable />
      ) : consultations.length === 0 ? (
        <div className="panel p-12 text-center space-y-2">
          <Calendar className="mx-auto h-8 w-8 text-ink-muted opacity-40" />
          <p className="text-sm font-semibold text-ink">No consultations match criteria</p>
          <p className="text-xs text-ink-muted">Try clearing your filters or search keyword.</p>
        </div>
      ) : (
        <div className="panel overflow-hidden border border-line">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Advocate</th>
                <th>Practice Area</th>
                <th>Appointment Time</th>
                <th>Mode</th>
                <th>Fee</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c._id} className="hover:bg-paper/40 transition-colors">
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
                  <td className="text-xs text-ink-soft truncate max-w-[140px]">
                    {c.practiceArea || 'General'}
                  </td>
                  <td className="text-xs text-ink-muted">
                    {format(new Date(c.date || Date.now()), 'MMM d, yyyy')} • {c.timeSlot}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-xs capitalize text-ink-soft">
                      {c.mode === 'video' ? (
                        <Video className="h-3 w-3 text-chamber-600" />
                      ) : c.mode === 'chat' ? (
                        <MessageSquare className="h-3 w-3 text-blue-600" />
                      ) : (
                        <MapPin className="h-3 w-3 text-amber-600" />
                      )}
                      {c.mode}
                    </span>
                  </td>
                  <td className="text-xs font-bold text-ink">
                    ₹{(c.fee || c.payment?.amount || 0).toLocaleString()}
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

      {/* Consultation Detail Modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Consultation Details"
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            {/* Parties Info */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-line bg-paper/30">
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Client</span>
                <p className="text-xs font-bold text-ink mt-0.5">{selected.client?.name}</p>
                <p className="text-[11px] text-ink-muted">{selected.client?.email}</p>
                {selected.client?.phone && <p className="text-[11px] text-ink-muted">{selected.client?.phone}</p>}
              </div>
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Advocate</span>
                <p className="text-xs font-bold text-ink mt-0.5">{selected.advocate?.name}</p>
                <p className="text-[11px] text-ink-muted">{selected.advocate?.email}</p>
                {selected.advocate?.phone && <p className="text-[11px] text-ink-muted">{selected.advocate?.phone}</p>}
              </div>
            </div>

            {/* Appointment Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Date & Slot</span>
                <span className="font-bold text-ink mt-0.5 block">
                  {format(new Date(selected.date || Date.now()), 'MMM d, yyyy')}
                </span>
                <span className="text-ink-muted text-[11px]">{selected.timeSlot} ({selected.duration || 60}m)</span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Consultation Mode</span>
                <span className="font-bold text-ink capitalize mt-0.5 block">{selected.mode}</span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Fee & Escrow</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  ₹{(selected.fee || selected.payment?.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] text-ink-muted block">Current Status</span>
                <div className="mt-0.5">
                  <Badge variant={STATUS_COLORS[selected.status] || 'default'} size="xs">
                    {selected.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Matter Description */}
            <div>
              <span className="text-xs font-bold text-ink block mb-1">Legal Issue Description:</span>
              <div className="panel p-3 text-xs text-ink leading-relaxed bg-paper/20 whitespace-pre-wrap">
                {selected.legalIssue || 'No specific description provided by client.'}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
