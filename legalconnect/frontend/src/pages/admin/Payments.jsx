import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { CreditCard, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import StatCard from '../../components/ui/StatCard.jsx';

const STATUS_COLORS = { Successful: 'success', Pending: 'warning', Failed: 'danger', Refunded: 'info' };

export default function AdminPayments() {
  const [data, setData] = useState({ payments: [], total: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getPayments({ limit: 100 }).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const platformRevenue = data.payments?.reduce((s, p) => s + (p.status === 'Successful' ? (p.amount - p.advocateAmount) : 0), 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Payments</h1>
        <p className="text-ink-soft mt-1">All transactions on the platform</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Gross Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString()}`} icon={IndianRupee} color="success" />
        <StatCard title="Platform Earnings" value={`₹${platformRevenue.toLocaleString()}`} icon={CreditCard} color="chamber" />
        <StatCard title="Transactions" value={data.total} icon={CreditCard} color="brass" />
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>Client</th><th>Advocate</th><th>Amount</th><th>Platform Fee</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {data.payments?.map((p) => (
                <tr key={p._id}>
                  <td><div className="flex items-center gap-2"><Avatar name={p.client?.name} size="xs" /><span className="text-sm">{p.client?.name}</span></div></td>
                  <td className="text-sm">{p.advocate?.name}</td>
                  <td className="font-medium">₹{p.amount?.toLocaleString()}</td>
                  <td className="text-ink-muted">₹{(p.amount - p.advocateAmount)?.toLocaleString()}</td>
                  <td className="text-ink-muted">{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                  <td><Badge variant={STATUS_COLORS[p.status] || 'default'}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.payments?.length === 0 && <div className="p-10 text-center text-ink-muted">No payments yet</div>}
        </div>
      )}
    </div>
  );
}
