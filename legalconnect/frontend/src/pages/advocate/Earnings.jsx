import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService.js';
import { CreditCard, TrendingUp, IndianRupee, Search, FileText, CheckCircle2, ShieldCheck, Download, X } from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { format } from 'date-fns';

const STATUS_FILTERS = ['', 'Successful', 'Pending', 'Refunded'];

export default function Earnings() {
  const [data, setData] = useState({ payments: [], total: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    paymentService
      .list({ status: statusFilter, limit: 100 })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const successful = data.payments?.filter((p) => p.status === 'Successful') || [];
  const thisMonth = successful.filter((p) => {
    const d = new Date(p.paidAt || p.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalAdvocateShare = successful.reduce((sum, p) => sum + (p.advocateAmount || 0), 0);
  const thisMonthShare = thisMonth.reduce((sum, p) => sum + (p.advocateAmount || 0), 0);

  const filtered = (data.payments || []).filter((p) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      p.client?.name?.toLowerCase().includes(s) ||
      p.receiptNumber?.toLowerCase().includes(s) ||
      p.consultation?.mode?.toLowerCase().includes(s) ||
      String(p.amount).includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-ink">Earnings & Payouts</h1>
        <p className="text-ink-soft text-sm mt-0.5">
          Track your consultation revenue, escrow payouts, and client receipts
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Earnings"
          value={`₹${(totalAdvocateShare || data.totalRevenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          color="success"
        />
        <StatCard
          title="This Month"
          value={`₹${thisMonthShare.toLocaleString()}`}
          icon={TrendingUp}
          color="chamber"
        />
        <StatCard
          title="Paid Consultations"
          value={successful.length}
          icon={CheckCircle2}
          color="brass"
        />
        <StatCard
          title="Payout Schedule"
          value="Weekly Automatic"
          icon={CreditCard}
          color="info"
        />
      </div>

      {/* Escrow Guarantee Notice */}
      <div className="rounded-xl p-4 bg-chamber-50 border border-chamber-200 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-chamber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-chamber-900">
          <p className="font-semibold">LegalConnect Escrow Protection Active</p>
          <p className="text-chamber-800 mt-0.5">
            Client consultation fees are held securely in escrow upon booking and released directly to your verified bank account upon session completion.
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments by client name, receipt ID, or session mode..."
            className="input-base pl-10 text-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium shrink-0 transition-colors ${
                statusFilter === s
                  ? 'bg-chamber-600 text-white shadow-sm'
                  : 'bg-white border border-line text-ink hover:border-chamber-300'
              }`}
            >
              {s || 'All Transactions'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center space-y-2">
          <CreditCard className="mx-auto h-12 w-12 text-ink-muted mb-2 opacity-50" />
          <p className="font-semibold text-ink text-base">No transaction records found</p>
          <p className="text-xs text-ink-muted">
            {search || statusFilter ? 'Try clearing your search query or status filter.' : 'Earnings appear here once clients book paid consultations with you.'}
          </p>
        </div>
      ) : (
        <div className="panel overflow-x-auto shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Receipt / Ref</th>
                <th>Client Paid</th>
                <th>Your Share (90%)</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-paper/40 transition-colors">
                  <td className="font-semibold text-ink text-sm">
                    {p.client?.name || 'Client'}
                  </td>
                  <td className="text-xs text-ink-muted">
                    {p.paidAt
                      ? format(new Date(p.paidAt), 'MMM d, yyyy')
                      : format(new Date(p.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="capitalize text-xs text-ink-soft">
                    {p.consultation?.mode || 'Session'}
                  </td>
                  <td className="font-mono text-xs text-ink-muted">
                    {p.receiptNumber || p._id.slice(-8)}
                  </td>
                  <td className="text-xs text-ink font-medium">
                    ₹{p.amount?.toLocaleString()}
                  </td>
                  <td className="font-bold text-xs text-emerald-600">
                    ₹{(p.advocateAmount || Math.round(p.amount * 0.9))?.toLocaleString()}
                  </td>
                  <td>
                    <Badge variant={p.status === 'Successful' ? 'success' : p.status === 'Pending' ? 'warning' : 'default'} size="xs">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="text-xs text-chamber-700 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" /> View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipt Inspection Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold text-lg text-ink">Payment Receipt</h3>
                <p className="font-mono text-xs text-ink-muted mt-0.5">
                  #{selectedReceipt.receiptNumber || selectedReceipt._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-paper transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-muted">Client Name:</span>
                <span className="font-semibold text-ink">{selectedReceipt.client?.name || 'Client'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-muted">Transaction Date:</span>
                <span className="text-ink">
                  {format(new Date(selectedReceipt.paidAt || selectedReceipt.createdAt), 'MMMM d, yyyy, h:mm a')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-muted">Consultation Mode:</span>
                <span className="capitalize font-medium text-ink">
                  {selectedReceipt.consultation?.mode || 'Legal Consultation'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-muted">Gross Amount Paid:</span>
                <span className="font-semibold text-ink">₹{selectedReceipt.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-muted">Platform Facilitation (10%):</span>
                <span className="text-ink-muted">
                  -₹{(selectedReceipt.platformFee || Math.round(selectedReceipt.amount * 0.1))?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-line text-sm font-bold text-emerald-700">
                <span>Net Advocate Payout:</span>
                <span>₹{(selectedReceipt.advocateAmount || Math.round(selectedReceipt.amount * 0.9))?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-paper/60 border border-line text-[11px] text-ink-muted">
                Status: <span className="font-semibold text-emerald-600">{selectedReceipt.status}</span> • Processed via LegalConnect Escrow
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
