import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService.js';
import { CreditCard, TrendingUp, IndianRupee } from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { format } from 'date-fns';

export default function Earnings() {
  const [data, setData] = useState({ payments: [], total: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.list({ limit: 50 }).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const successful = data.payments?.filter((p) => p.status === 'Successful');
  const thisMonth = successful?.filter((p) => {
    const d = new Date(p.paidAt || p.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Earnings</h1>
        <p className="text-ink-soft mt-1">Track your consultation revenue</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString()}`} icon={IndianRupee} color="success" />
        <StatCard title="This Month" value={`₹${thisMonth?.reduce((s, p) => s + (p.advocateAmount || 0), 0).toLocaleString()}`} icon={TrendingUp} color="chamber" />
        <StatCard title="Payments" value={successful?.length || 0} icon={CreditCard} color="brass" />
      </div>

      {loading ? <SkeletonTable /> : (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>Client</th><th>Date</th><th>Mode</th><th>Amount</th><th>Your Share</th><th>Status</th></tr></thead>
            <tbody>
              {data.payments?.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium">{p.client?.name}</td>
                  <td className="text-ink-muted">{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                  <td className="capitalize text-ink-muted">{p.consultation?.mode || '—'}</td>
                  <td>₹{p.amount?.toLocaleString()}</td>
                  <td className="font-medium text-emerald-600">₹{p.advocateAmount?.toLocaleString()}</td>
                  <td><Badge variant={p.status === 'Successful' ? 'success' : p.status === 'Pending' ? 'warning' : 'default'}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.payments?.length === 0 && <div className="p-10 text-center text-ink-muted">No payment records yet</div>}
        </div>
      )}
    </div>
  );
}
