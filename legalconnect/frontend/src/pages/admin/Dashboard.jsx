import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import StatCard from '../../components/ui/StatCard.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { Users, Scale, Calendar, CreditCard, ShieldCheck, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  );

  const { stats = {}, recentPayments = [], recentConsultations = [] } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl">Admin Dashboard</h1>
        <p className="text-ink-soft mt-1">Platform overview and key metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Clients" value={stats.totalClients?.toLocaleString()} icon={Users} color="chamber" />
        <StatCard title="Total Advocates" value={stats.totalAdvocates?.toLocaleString()} icon={Scale} color="brass" />
        <StatCard title="Verified Advocates" value={stats.verifiedAdvocates?.toLocaleString()} icon={ShieldCheck} color="success" />
        <StatCard title="Active Cases" value={stats.activeCases?.toLocaleString()} icon={FileText} color="info" />
        <StatCard title="Consultations" value={stats.totalConsultations?.toLocaleString()} icon={Calendar} color="chamber" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} icon={CreditCard} color="success" />
        <StatCard title="Pending Reports" value={stats.pendingReports} icon={AlertCircle} color="danger" />
        <StatCard title="Pending Verifications" value={stats.pendingVerifications} icon={ShieldCheck} color="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Consultations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Recent Consultations</h2>
            <Link to="/admin/consultations" className="text-sm text-chamber-600 hover:underline">View all</Link>
          </div>
          <div className="panel divide-y divide-line">
            {recentConsultations.map((c) => (
              <div key={c._id} className="flex items-center gap-3 p-4">
                <Avatar name={c.client?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.client?.name}</p>
                  <p className="text-xs text-ink-muted">{c.advocate?.name} · {format(new Date(c.createdAt), 'MMM d')}</p>
                </div>
                <Badge variant={c.status === 'Confirmed' ? 'success' : 'warning'}>{c.status}</Badge>
              </div>
            ))}
            {recentConsultations.length === 0 && <div className="p-6 text-center text-sm text-ink-muted">No recent consultations</div>}
          </div>
        </div>

        {/* Recent Payments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Recent Payments</h2>
            <Link to="/admin/payments" className="text-sm text-chamber-600 hover:underline">View all</Link>
          </div>
          <div className="panel divide-y divide-line">
            {recentPayments.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-4">
                <Avatar name={p.client?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.client?.name}</p>
                  <p className="text-xs text-ink-muted">to {p.advocate?.name} · {format(new Date(p.createdAt), 'MMM d')}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">₹{p.amount?.toLocaleString()}</span>
              </div>
            ))}
            {recentPayments.length === 0 && <div className="p-6 text-center text-sm text-ink-muted">No recent payments</div>}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-lg mb-4">Admin Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: '/admin/verification', label: 'Review Verifications', icon: ShieldCheck, badge: stats.pendingVerifications },
            { to: '/admin/reports', label: 'Handle Reports', icon: AlertCircle, badge: stats.pendingReports },
            { to: '/admin/users', label: 'Manage Users', icon: Users },
            { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
          ].map(({ to, label, icon: Icon, badge }) => (
            <Link key={to} to={to} className="panel p-4 flex flex-col items-center gap-2 text-center hover:border-chamber-300 hover:shadow-md transition-all relative">
              <Icon className="h-6 w-6 text-chamber-600" />
              <span className="text-sm font-medium">{label}</span>
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-danger-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
