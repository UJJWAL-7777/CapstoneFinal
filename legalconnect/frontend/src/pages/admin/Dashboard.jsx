import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import StatCard from '../../components/ui/StatCard.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import {
  Users,
  Scale,
  Calendar,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
  RefreshCw,
  Award,
  Sliders,
  CheckCircle2,
  Receipt,
  IndianRupee,
  ScrollText,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'consultations'

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAnalytics().catch(() => null),
      ]);
      setData(dashRes);
      setAnalytics(analyticsRes);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-paper rounded w-1/3"></div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { stats = {}, recentPayments = [], recentConsultations = [] } = data || {};
  const revenueTrends = analytics?.revenueTrends || [];
  const consultationTrends = analytics?.consultationTrends || [];

  // Chart data formatting
  const chartData = revenueTrends.map((r, i) => ({
    month: r.month,
    grossRevenue: r.grossRevenue || 0,
    platformCommission: r.platformCommission || 0,
    consultations: consultationTrends[i]?.count || 0,
  }));

  const pendingTotal = (stats.pendingVerifications || 0) + (stats.pendingReports || 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header & System Health Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-ink">Admin Command Center</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
          <p className="text-ink-soft text-sm mt-1">
            Real-time platform metrics, regulatory compliance, and financial overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadData}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Data
          </Button>
          <Link to="/admin/analytics">
            <Button size="sm">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Required Banners (if pending items exist) */}
      {pendingTotal > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.pendingVerifications > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    {stats.pendingVerifications} Advocate{stats.pendingVerifications > 1 ? 's' : ''} Pending Verification
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Bar Council credentials awaiting background validation
                  </p>
                </div>
              </div>
              <Link to="/admin/verification">
                <Button size="xs" variant="secondary" className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100/50">
                  Review <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {stats.pendingReports > 0 && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-rose-100 text-rose-800">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900">
                    {stats.pendingReports} Unresolved Misconduct Report{stats.pendingReports > 1 ? 's' : ''}
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    User complaints and safety flags requiring administrative review
                  </p>
                </div>
              </div>
              <Link to="/admin/reports">
                <Button size="xs" variant="secondary" className="bg-white border-rose-300 text-rose-900 hover:bg-rose-100/50">
                  Resolve <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={stats.totalClients?.toLocaleString() || '0'}
          icon={Users}
          color="chamber"
          subtitle="Registered seekers"
        />
        <StatCard
          title="Total Advocates"
          value={stats.totalAdvocates?.toLocaleString() || '0'}
          icon={Scale}
          color="brass"
          subtitle={`${stats.verifiedAdvocates || 0} verified`}
        />
        <StatCard
          title="Active Court Cases"
          value={stats.activeCases?.toLocaleString() || '0'}
          icon={FileText}
          color="info"
          subtitle="Ongoing litigation"
        />
        <StatCard
          title="Total Consultations"
          value={stats.totalConsultations?.toLocaleString() || '0'}
          icon={Calendar}
          color="chamber"
          subtitle="Completed sessions"
        />
        <StatCard
          title="Gross Escrow Volume"
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          color="success"
          subtitle="Total handled transactions"
        />
        <StatCard
          title="Platform Commission"
          value={`₹${Math.round((stats.totalRevenue || 0) * 0.1).toLocaleString()}`}
          icon={CreditCard}
          color="chamber"
          subtitle="Net platform fee (10%)"
        />
        <StatCard
          title="Verified Rate"
          value={
            stats.totalAdvocates > 0
              ? `${Math.round(((stats.verifiedAdvocates || 0) / stats.totalAdvocates) * 100)}%`
              : '100%'
          }
          icon={ShieldCheck}
          color="success"
          subtitle="Advocate compliance"
        />
        <StatCard
          title="Pending Actions"
          value={pendingTotal}
          icon={Activity}
          color={pendingTotal > 0 ? 'warning' : 'success'}
          subtitle="Verification & Reports"
        />
      </div>

      {/* Interactive Platform Trends Mini-Chart */}
      {chartData.length > 0 && (
        <div className="panel p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chamber-700" />
                Platform Growth & Volume (Last 6 Months)
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Monthly trends for gross client escrow deposits and legal consultation bookings
              </p>
            </div>
            <div className="flex gap-1.5 p-1 bg-paper rounded-lg border border-line">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMetric === 'revenue'
                    ? 'bg-white text-chamber-800 shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric('consultations')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMetric === 'consultations'
                    ? 'bg-white text-chamber-800 shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Consultations Count
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'revenue' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#802828" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#802828" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashComm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      `₹${val.toLocaleString()}`,
                      name === 'grossRevenue' ? 'Gross Volume' : 'Platform Cut (10%)',
                    ]}
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="grossRevenue"
                    stroke="#802828"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dashGross)"
                    name="grossRevenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="platformCommission"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dashComm)"
                    name="platformCommission"
                  />
                </AreaChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashConsult" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b45309" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip
                    formatter={(val) => [val, 'Consultations']}
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="consultations"
                    stroke="#b45309"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dashConsult)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Live Activity Grids */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Consultations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Calendar className="h-4 w-4 text-chamber-700" />
              Latest Consultation Bookings
            </h2>
            <Link
              to="/admin/consultations"
              className="text-xs font-semibold text-chamber-600 hover:text-chamber-800 flex items-center gap-1"
            >
              All consultations <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="panel divide-y divide-line shadow-xs">
            {recentConsultations.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3.5 hover:bg-paper/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={c.client?.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{c.client?.name || 'Client'}</p>
                    <p className="text-xs text-ink-muted truncate">
                      with <span className="font-medium text-ink-soft">{c.advocate?.name || 'Advocate'}</span> ·{' '}
                      {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <span className="text-xs font-bold text-ink">₹{c.fee?.toLocaleString() || '1,500'}</span>
                  <Badge variant={c.status === 'Confirmed' ? 'success' : c.status === 'Completed' ? 'info' : 'warning'} size="xs">
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
            {recentConsultations.length === 0 && (
              <div className="p-8 text-center text-sm text-ink-muted">No recent consultations recorded</div>
            )}
          </div>
        </div>

        {/* Recent Escrow Payments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              Recent Escrow Settlements
            </h2>
            <Link
              to="/admin/payments"
              className="text-xs font-semibold text-chamber-600 hover:text-chamber-800 flex items-center gap-1"
            >
              All transactions <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="panel divide-y divide-line shadow-xs">
            {recentPayments.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3.5 hover:bg-paper/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={p.client?.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{p.client?.name || 'Client'}</p>
                    <p className="text-xs text-ink-muted truncate">
                      paid to <span className="font-medium text-ink-soft">{p.advocate?.name || 'Advocate'}</span> ·{' '}
                      {format(new Date(p.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-sm font-bold text-emerald-700 block">
                    ₹{p.amount?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    Comm: ₹{(p.platformFee || Math.round(p.amount * 0.1))?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <div className="p-8 text-center text-sm text-ink-muted">No recent payments recorded</div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Admin Operations Directory */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-ink">Administrative Management Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { to: '/admin/verification', label: 'Verifications', icon: ShieldCheck, badge: stats.pendingVerifications },
            { to: '/admin/reports', label: 'Reports', icon: AlertCircle, badge: stats.pendingReports },
            { to: '/admin/users', label: 'User Directory', icon: Users },
            { to: '/admin/advocates', label: 'Advocate Profiles', icon: Scale },
            { to: '/admin/consultations', label: 'Consultations', icon: Calendar },
            { to: '/admin/cases', label: 'Legal Cases', icon: FileText },
            { to: '/admin/payments', label: 'Escrow Settlements', icon: Receipt },
            { to: '/admin/badges', label: 'Award Badges', icon: Award },
            { to: '/admin/analytics', label: 'Platform Analytics', icon: TrendingUp },
            { to: '/admin/audit-logs', label: 'Audit Trail', icon: ScrollText },
            { to: '/admin/settings', label: 'System Settings', icon: Sliders },
          ].map(({ to, label, icon: Icon, badge }) => (
            <Link
              key={to}
              to={to}
              className="panel p-4 flex flex-col items-center gap-2 text-center hover:border-chamber-400 hover:shadow-md transition-all relative group bg-white"
            >
              <div className="p-2 rounded-xl bg-paper group-hover:bg-chamber-50 transition-colors">
                <Icon className="h-5 w-5 text-chamber-700 group-hover:text-chamber-900 transition-colors" />
              </div>
              <span className="text-xs font-semibold text-ink group-hover:text-chamber-900">
                {label}
              </span>
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-danger-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
