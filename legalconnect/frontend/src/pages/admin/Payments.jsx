import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { CreditCard, IndianRupee, Search, X, Receipt, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';

const STATUS_COLORS = {
  Successful: 'success',
  Pending: 'warning',
  Failed: 'danger',
  Refunded: 'info',
};

const STATUS_FILTERS = ['', 'Successful', 'Pending', 'Failed', 'Refunded'];

export default function AdminPayments() {
  const [data, setData] = useState({ payments: [], total: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    adminService
      .getPayments({ limit: 100 })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const successfulPayments = data.payments?.filter((p) => p.status === 'Successful') || [];
  const platformRevenue = successfulPayments.reduce(
    (s, p) => s + (p.platformFee || (p.amount - (p.advocateAmount || 0))),
    0
  );

  const filteredPayments = data.payments?.filter((p) => {
    const matchesStatus = !statusFilter || p.status === statusFilter;
    const matchesSearch =
      !search ||
      p.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.advocate?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p._id?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-ink">Payments & Escrow Transactions</h1>
        <p className="text-ink-soft text-sm mt-0.5">Comprehensive audit trail of all platform escrow and fee settlements</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Gross Escrow Volume"
          value={`₹${(data.totalRevenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          color="success"
          subtitle={`${successfulPayments.length} successful`}
        />
        <StatCard
          title="Platform Commission (10%)"
          value={`₹${platformRevenue.toLocaleString()}`}
          icon={CreditCard}
          color="chamber"
          subtitle="Direct platform revenue"
        />
        <StatCard
          title="Total Transactions"
          value={data.total || data.payments?.length || 0}
          icon={Receipt}
          color="brass"
          subtitle="All recorded events"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === s
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, advocate, receipt..."
            className="input-base pl-9 text-xs py-1.5"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="panel overflow-x-auto shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt / ID</th>
                <th>Client</th>
                <th>Advocate</th>
                <th>Total Fee</th>
                <th>Platform (10%)</th>
                <th>Advocate (90%)</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-paper/50 cursor-pointer"
                  onClick={() => setSelectedPayment(p)}
                >
                  <td>
                    <span className="font-mono text-xs font-semibold text-chamber-700 block">
                      {p.receiptNumber || p._id?.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-ink-muted capitalize">
                      {p.gateway || 'Escrow'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={p.client?.name} size="xs" />
                      <span className="text-sm font-medium text-ink">{p.client?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="text-sm font-medium text-ink">{p.advocate?.name || '—'}</td>
                  <td className="font-bold text-ink">₹{p.amount?.toLocaleString()}</td>
                  <td className="text-xs text-ink-muted">
                    ₹{(p.platformFee || Math.round(p.amount * 0.1))?.toLocaleString()}
                  </td>
                  <td className="text-xs font-semibold text-emerald-600">
                    ₹{(p.advocateAmount || Math.round(p.amount * 0.9))?.toLocaleString()}
                  </td>
                  <td className="text-xs text-ink-muted">
                    {format(new Date(p.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <Badge variant={STATUS_COLORS[p.status] || 'default'} size="xs">
                      {p.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPayment(p);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-12 text-center text-ink-muted text-sm">
              No payment transactions match your query.
            </div>
          )}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold text-base text-ink">Transaction Receipt</h3>
                <p className="text-xs font-mono text-chamber-700 mt-0.5">
                  {selectedPayment.receiptNumber || selectedPayment._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-1 text-ink-muted hover:bg-paper"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 bg-paper/60 rounded-lg">
                <span className="text-ink-muted">Payment Status:</span>
                <Badge variant={STATUS_COLORS[selectedPayment.status] || 'default'}>
                  {selectedPayment.status}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-muted">Client:</span>
                <span className="font-semibold text-ink">{selectedPayment.client?.name || '—'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-muted">Advocate:</span>
                <span className="font-semibold text-ink">{selectedPayment.advocate?.name || '—'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-muted">Transaction Date:</span>
                <span className="font-medium text-ink">
                  {format(new Date(selectedPayment.createdAt), 'EEEE, MMMM d, yyyy h:mm a')}
                </span>
              </div>

              {selectedPayment.gatewayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Gateway Ref:</span>
                  <span className="font-mono text-ink">{selectedPayment.gatewayPaymentId}</span>
                </div>
              )}

              <div className="border-t border-line pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Gross Amount:</span>
                  <span className="font-bold text-ink">₹{selectedPayment.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Platform Fee (10%):</span>
                  <span>₹{(selectedPayment.platformFee || Math.round(selectedPayment.amount * 0.1))?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Advocate Net Payout:</span>
                  <span>₹{(selectedPayment.advocateAmount || Math.round(selectedPayment.amount * 0.9))?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-line flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
