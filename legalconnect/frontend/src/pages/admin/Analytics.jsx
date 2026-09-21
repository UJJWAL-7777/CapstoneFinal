import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  BarChart2,
  TrendingUp,
  Users,
  Scale,
  Calendar,
  IndianRupee,
  Download,
  ShieldCheck,
  CreditCard,
  PieChart as PieIcon,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#32463d', '#967846', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminAnalytics() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    adminService
      .getAnalytics()
      .then(setData)
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        toast.error('Failed to load analytics data');
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = (filename, rows) => {
    if (!rows || !rows.length) {
      toast.error('No data available to export');
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((row) =>
          headers
            .map((fieldName) => {
              const val = row[fieldName] ?? '';
              return `"${String(val).replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename}`);
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      if (type === 'Users') {
        const res = await adminService.getUsers({ limit: 500 });
        const rows = (res.users || []).map((u) => ({
          ID: u._id,
          Name: u.name,
          Email: u.email,
          Role: u.role,
          Status: u.status,
          JoinedDate: new Date(u.createdAt).toISOString().split('T')[0],
        }));
        downloadCsv(`legalconnect_users_${new Date().toISOString().split('T')[0]}.csv`, rows);
      } else if (type === 'Consultations') {
        const res = await adminService.getConsultations({ limit: 500 });
        const rows = (res.consultations || []).map((c) => ({
          ID: c._id,
          ClientName: c.client?.name || 'N/A',
          AdvocateName: c.advocate?.name || 'N/A',
          PracticeArea: c.practiceArea || 'General',
          Date: new Date(c.date).toISOString().split('T')[0],
          TimeSlot: c.timeSlot,
          Mode: c.mode,
          Fee: c.fee || c.payment?.amount || 0,
          Status: c.status,
        }));
        downloadCsv(`legalconnect_consultations_${new Date().toISOString().split('T')[0]}.csv`, rows);
      } else if (type === 'Payments') {
        const res = await adminService.getPayments({ limit: 500 });
        const rows = (res.payments || []).map((p) => ({
          ID: p._id,
          ReceiptNumber: p.receiptNumber || 'N/A',
          Client: p.client?.name || 'N/A',
          Advocate: p.advocate?.name || 'N/A',
          GrossAmount: p.amount,
          AdvocatePayout: p.advocateAmount,
          PlatformFee: p.platformFee,
          Status: p.status,
          PaidAt: p.paidAt ? new Date(p.paidAt).toISOString() : 'N/A',
        }));
        downloadCsv(`legalconnect_payments_${new Date().toISOString().split('T')[0]}.csv`, rows);
      } else if (type === 'Cases') {
        const res = await adminService.getCases({ limit: 500 });
        const rows = (res.cases || []).map((c) => ({
          CaseNumber: c.caseId,
          Title: c.title,
          Client: c.client?.name || 'N/A',
          Advocate: c.advocate?.name || 'N/A',
          PracticeArea: c.practiceArea || 'General',
          CourtName: c.courtName || 'N/A',
          Status: c.status,
          Priority: c.priority,
          OpenedDate: new Date(c.createdAt).toISOString().split('T')[0],
        }));
        downloadCsv(`legalconnect_cases_${new Date().toISOString().split('T')[0]}.csv`, rows);
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error(`Failed to export ${type} data`);
    } finally {
      setExporting('');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const { stats = {}, revenueChart = [], practiceAreas = [] } = data || {};

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-chamber-700" /> Platform Analytics & Insights
          </h1>
          <p className="text-ink-soft text-sm mt-0.5">
            Real-time financial performance, consultation trends, and domain metrics
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Escrow Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          color="success"
          subtitle="All successful transactions"
        />
        <StatCard
          title="Platform Commission"
          value={`₹${(stats.totalPlatformFee || Math.round((stats.totalRevenue || 0) * 0.1)).toLocaleString()}`}
          icon={CreditCard}
          color="chamber"
          subtitle="Net platform earnings"
        />
        <StatCard
          title="Verified Advocates"
          value={`${stats.verifiedAdvocates || 0} / ${stats.totalAdvocates || 0}`}
          icon={ShieldCheck}
          color="brass"
          subtitle="Identity & Bar authenticated"
        />
        <StatCard
          title="Active Court Matters"
          value={stats.activeCases || 0}
          icon={Scale}
          color="info"
          subtitle="Open dispute workspaces"
        />
      </div>

      {/* Primary Chart: Monthly Revenue & Commission */}
      <div className="panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" /> Revenue & Platform Volume Trend
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">6-month rolling transaction volume and platform earnings</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-chamber-700">
              <span className="h-2.5 w-2.5 rounded-full bg-chamber-700" /> Gross Volume
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Platform Net
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#32463d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#32463d" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#32463d" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              <Area type="monotone" dataKey="platformFee" name="Platform Fee" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#feeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts: Consultation Trends & Practice Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Consultation Activity */}
        <div className="panel p-6 space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brass-600" /> Monthly Consultations Breakdown
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">Confirmed and completed consultation volume</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="consultations" name="Total Consultations" fill="#967846" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Practice Area Distribution */}
        <div className="panel p-6 space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-chamber-700" /> Practice Area Demand Distribution
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">Most sought-after legal practice domains</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between h-64">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={practiceAreas}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {practiceAreas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-1.5 pl-2 overflow-y-auto max-h-56 scrollbar-thin">
              {practiceAreas.map((entry, i) => (
                <div key={entry.name} className="flex items-center justify-between text-xs py-1">
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="truncate text-ink font-medium">{entry.name}</span>
                  </span>
                  <span className="font-bold text-ink-soft ml-2 shrink-0">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSV Exports Section */}
      <div className="panel p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-ink">Export Platform Records (CSV)</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Download clean, compliant CSV datasets for external regulatory audit, accounting, and compliance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {['Users', 'Consultations', 'Payments', 'Cases'].map((type) => (
            <Button
              key={type}
              type="button"
              variant="secondary"
              size="sm"
              loading={exporting === type}
              onClick={() => handleExport(type)}
              className="gap-2 justify-center py-2.5 text-xs font-semibold shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" /> Export {type}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
