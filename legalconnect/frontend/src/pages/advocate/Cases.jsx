import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, ChevronRight, Plus, Search, User, Gavel, FileText, AlertCircle } from 'lucide-react';
import { caseService } from '../../services/caseService.js';
import { consultationService } from '../../services/consultationService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { format } from 'date-fns';
import { PRACTICE_AREAS } from '../../utils/constants.js';

const STATUS_COLORS = {
  Opened: 'primary',
  'In Progress': 'info',
  Hearing: 'warning',
  Resolved: 'success',
  Closed: 'default',
};
const PRIORITY_COLORS = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
};
const STATUSES = ['', 'Opened', 'In Progress', 'Hearing', 'Resolved', 'Closed'];

export default function AdvocateCases() {
  const toast = useToast();
  const location = useLocation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Create Case Modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clients, setClients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [form, setForm] = useState({
    clientId: '',
    consultationId: '',
    title: '',
    practiceArea: 'Civil Litigation',
    priority: 'medium',
    courtName: '',
    caseNumber: '',
    description: '',
  });

  const loadCases = async () => {
    setLoading(true);
    try {
      const d = await caseService.list({ status: statusFilter, search: search.trim(), limit: 50 });
      setCases(d.cases || []);
    } catch {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter, search]);

  // Load clients and eligible consultations for case creation
  useEffect(() => {
    Promise.all([
      consultationService.list({ limit: 100 }).catch(() => ({ consultations: [] })),
      caseService.list({ limit: 100 }).catch(() => ({ cases: [] })),
    ]).then(([consRes, casesRes]) => {
      const consList = consRes.consultations || [];
      const casesList = casesRes.cases || [];

      // Extract unique clients
      const clientMap = new Map();
      consList.forEach((c) => {
        if (c.client?._id && !clientMap.has(c.client._id)) {
          clientMap.set(c.client._id, c.client);
        }
      });
      casesList.forEach((c) => {
        if (c.client?._id && !clientMap.has(c.client._id)) {
          clientMap.set(c.client._id, c.client);
        }
      });

      const uniqueClients = Array.from(clientMap.values());
      setClients(uniqueClients);

      // Consultations without an opened case
      const availableCons = consList.filter(
        (c) => !c.case && (c.status === 'Confirmed' || c.status === 'Completed')
      );
      setConsultations(availableCons);

      // Check if opened via query state (e.g. from consultations page)
      if (location.state?.prefillClientId) {
        setForm((prev) => ({
          ...prev,
          clientId: location.state.prefillClientId,
          consultationId: location.state.prefillConsultationId || '',
          title: location.state.prefillTitle || '',
          practiceArea: location.state.prefillPracticeArea || 'Civil Litigation',
        }));
        setShowCreate(true);
      }
    });
  }, [location.state]);

  const handleConsultationSelect = (consId) => {
    if (!consId) {
      setForm((p) => ({ ...p, consultationId: '' }));
      return;
    }
    const selected = consultations.find((c) => c._id === consId);
    if (selected) {
      setForm((p) => ({
        ...p,
        consultationId: consId,
        clientId: selected.client?._id || p.clientId,
        title: p.title || `${selected.practiceArea || 'Legal'} Matter — ${selected.client?.name || 'Client'}`,
        practiceArea: selected.practiceArea || p.practiceArea,
        description: p.description || selected.legalIssue || '',
      }));
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Please enter a case title');
      return;
    }
    if (!form.clientId) {
      toast.error('Please select a client for this case');
      return;
    }

    setCreating(true);
    try {
      const created = await caseService.create({
        clientId: form.clientId,
        consultationId: form.consultationId || undefined,
        title: form.title.trim(),
        practiceArea: form.practiceArea,
        priority: form.priority,
        courtName: form.courtName?.trim(),
        caseNumber: form.caseNumber?.trim(),
        description: form.description?.trim(),
      });

      toast.success(`Case "${created.title}" opened successfully!`);
      setCases((prev) => [created, ...prev]);
      setShowCreate(false);
      setForm({
        clientId: '',
        consultationId: '',
        title: '',
        practiceArea: 'Civil Litigation',
        priority: 'medium',
        courtName: '',
        caseNumber: '',
        description: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create case');
    } finally {
      setCreating(false);
    }
  };

  const filtered = cases.filter((c) => {
    const matchesSearch =
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.caseId?.toLowerCase().includes(search.toLowerCase()) ||
      c.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.practiceArea?.toLowerCase().includes(search.toLowerCase()) ||
      c.courtName?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with Create Case Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Cases</h1>
          <p className="text-ink-soft text-sm mt-0.5">
            Manage your legal matters, hearings, filings, and case timelines
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowCreate(true)}
          className="gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Create New Case
        </Button>
      </div>

      {/* Search & Status Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases by title, matter ID, client name, or court..."
            className="input-base pl-10 text-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {STATUSES.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium shrink-0 transition-colors ${
                statusFilter === s
                  ? 'bg-chamber-600 text-white shadow-sm'
                  : 'bg-white border border-line text-ink hover:border-chamber-300'
              }`}
            >
              {s || 'All Cases'}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center space-y-3">
          <Scale className="mx-auto h-12 w-12 text-ink-muted opacity-60" />
          <p className="text-lg font-semibold text-ink">
            {search || statusFilter ? 'No matching cases found' : 'No cases opened yet'}
          </p>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            {search || statusFilter
              ? 'Try modifying your search keywords or clearing your status filter.'
              : 'Open a new legal case matter for a client to start sharing documents, assigning tasks, and scheduling hearings.'}
          </p>
          <Button
            size="md"
            className="gap-1.5 mt-2"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4" /> Open Your First Case
          </Button>
        </div>
      ) : (
        <div className="panel divide-y divide-line shadow-sm overflow-hidden">
          {filtered.map((c) => (
            <Link
              key={c._id}
              to={`/advocate/cases/${c._id}`}
              className="flex items-center gap-4 p-4 hover:bg-paper/40 transition-colors group"
            >
              <div className="p-2 rounded-xl bg-chamber-50 border border-chamber-100 text-chamber-700 shrink-0 group-hover:scale-105 transition-transform">
                <Scale className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-ink truncate group-hover:text-chamber-700 transition-colors">
                    {c.title}
                  </p>
                  <span className="text-xs text-ink-muted font-mono shrink-0">
                    #{c.caseId || c._id.slice(-6)}
                  </span>
                  {c.priority && (
                    <Badge variant={PRIORITY_COLORS[c.priority] || 'default'} size="xs">
                      {c.priority}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted mt-1">
                  <span className="flex items-center gap-1 font-medium text-ink">
                    <User className="h-3 w-3 text-chamber-600" />
                    {c.client?.name || 'Client'}
                  </span>
                  <span>•</span>
                  <span>{c.practiceArea || 'General Legal'}</span>
                  {c.courtName && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Gavel className="h-3 w-3 text-amber-600" />
                        {c.courtName}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_COLORS[c.status] || 'default'}>
                  {c.status}
                </Badge>
                <ChevronRight className="h-4 w-4 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Open New Case Matter"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateCase}
              loading={creating}
              disabled={!form.title.trim() || !form.clientId}
            >
              Open Case
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateCase} className="space-y-4 text-left">
          {/* Optional consultation link */}
          {consultations.length > 0 && (
            <div className="p-3 rounded-xl bg-paper/60 border border-line space-y-1.5">
              <label className="block text-xs font-semibold text-ink">
                Link to Completed / Confirmed Consultation (Optional)
              </label>
              <select
                value={form.consultationId}
                onChange={(e) => handleConsultationSelect(e.target.value)}
                className="input-base text-xs"
              >
                <option value="">-- Standalone Case (No Consultation Link) --</option>
                {consultations.map((cn) => (
                  <option key={cn._id} value={cn._id}>
                    {cn.client?.name} — {cn.practiceArea || 'Consultation'} ({format(new Date(cn.date), 'MMM d, yyyy')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Client selector */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Select Client <span className="text-danger-500">*</span>
            </label>
            {clients.length > 0 ? (
              <select
                value={form.clientId}
                onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
                className="input-base text-xs"
                required
              >
                <option value="">-- Choose a Client --</option>
                {clients.map((cl) => (
                  <option key={cl._id} value={cl._id}>
                    {cl.name} ({cl.email || cl.phone || 'Connected Client'})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.clientId}
                onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
                placeholder="Enter Client User ID"
                className="input-base text-xs"
                required
              />
            )}
          </div>

          {/* Case Title */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Case Title / Matter Name <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Property Boundary Dispute — Mehta vs. Sharma"
              className="input-base text-xs"
              required
            />
          </div>

          {/* Practice Area & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Practice Area
              </label>
              <select
                value={form.practiceArea}
                onChange={(e) => setForm((p) => ({ ...p, practiceArea: e.target.value }))}
                className="input-base text-xs"
              >
                {PRACTICE_AREAS.map((pa) => (
                  <option key={pa} value={pa}>{pa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Priority Level
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="input-base text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Court Name & Case Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Court / Tribunal (Optional)
              </label>
              <input
                type="text"
                value={form.courtName}
                onChange={(e) => setForm((p) => ({ ...p, courtName: e.target.value }))}
                placeholder="e.g. Delhi High Court / Civil Court"
                className="input-base text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Filing / Case Number (Optional)
              </label>
              <input
                type="text"
                value={form.caseNumber}
                onChange={(e) => setForm((p) => ({ ...p, caseNumber: e.target.value }))}
                placeholder="e.g. CS(OS) 234/2024"
                className="input-base text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Case Summary / Initial Brief
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Outline the core dispute, facts, and legal relief sought..."
              className="input-base text-xs resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
