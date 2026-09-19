import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { BarChart2, TrendingUp, Users, Scale } from 'lucide-react';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getReports?.({ type: 'platform', limit: 1 }).then((d) => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Platform Reports</h1>
        <p className="text-ink-soft mt-1">Analytics and insights across the platform</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : [
          { label: 'New Users This Month', value: data?.stats?.newUsersThisMonth || '—', icon: Users, color: 'bg-chamber-50 text-chamber-600' },
          { label: 'New Cases This Month', value: data?.stats?.newCasesThisMonth || '—', icon: Scale, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Consultations This Month', value: data?.stats?.consultationsThisMonth || '—', icon: BarChart2, color: 'bg-brass-50 text-brass-600' },
          { label: 'Revenue This Month', value: `₹${(data?.stats?.revenueThisMonth || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-sky-50 text-sky-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="panel p-6 flex items-center gap-4">
            <div className={`rounded-xl p-3 ${color}`}><Icon className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-ink-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="panel p-6">
        <h2 className="text-lg mb-2">Export Reports</h2>
        <p className="text-sm text-ink-muted mb-4">Download platform data as CSV for external analysis.</p>
        <div className="flex gap-3">
          {['Users', 'Consultations', 'Payments', 'Cases'].map((type) => (
            <button key={type} className="rounded-lg border border-line px-4 py-2 text-sm hover:border-chamber-400 hover:text-chamber-700 transition-colors">
              Export {type} CSV
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
