import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Scale, Users, CreditCard, Star, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { consultationService } from '../../services/consultationService.js';
import { caseService } from '../../services/caseService.js';
import { paymentService } from '../../services/paymentService.js';
import StatCard from '../../components/ui/StatCard.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { format } from 'date-fns';

const STATUS_COLORS = { Pending: 'warning', Confirmed: 'success', Completed: 'default', Cancelled: 'danger' };

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [cases, setCases] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consultationService.list({ limit: 5 }),
      caseService.list({ limit: 5 }),
      paymentService.list({ limit: 1 }),
    ]).then(([cons, cas, pay]) => {
      setConsultations(cons.consultations || []);
      setCases(cas.cases || []);
      setRevenue(pay.totalRevenue || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pending = consultations.filter((c) => c.status === 'Pending').length;
  const upcoming = consultations.filter((c) => c.status === 'Confirmed' && new Date(c.date) >= new Date()).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-ink-soft mt-1">Here's your practice overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Pending Requests" value={pending} icon={Clock} color="warning" />
        <StatCard title="Upcoming" value={upcoming} icon={Calendar} color="chamber" />
        <StatCard title="Active Cases" value={cases.length} icon={Scale} color="info" />
        <StatCard title="Revenue" value={`₹${revenue.toLocaleString()}`} icon={CreditCard} color="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent consultations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Recent Consultations</h2>
            <Link to="/advocate/consultations" className="text-sm text-chamber-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loading ? <SkeletonCard /> : consultations.length === 0 ? (
            <div className="panel p-8 text-center text-ink-muted">No consultations yet</div>
          ) : (
            <div className="panel divide-y divide-line">
              {consultations.map((c) => (
                <div key={c._id} className="flex items-center gap-4 p-4">
                  <Avatar name={c.client?.name} src={c.client?.avatar?.url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{c.client?.name}</p>
                    <p className="text-xs text-ink-muted">{format(new Date(c.date), 'MMM d')} · {c.timeSlot} · {c.mode}</p>
                  </div>
                  <Badge variant={STATUS_COLORS[c.status] || 'default'}>{c.status}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Recent cases */}
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-lg">Active Cases</h2>
            <Link to="/advocate/cases" className="text-sm text-chamber-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loading ? <SkeletonCard /> : (
            <div className="panel divide-y divide-line">
              {cases.slice(0, 3).map((c) => (
                <Link key={c._id} to={`/advocate/cases/${c._id}`} className="flex items-center gap-3 p-4 hover:bg-paper transition-colors">
                  <Scale className="h-5 w-5 text-chamber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.title}</p>
                    <p className="text-xs text-ink-muted">{c.client?.name} · {c.practiceArea}</p>
                  </div>
                  <Badge variant="primary">{c.status}</Badge>
                </Link>
              ))}
              {cases.length === 0 && <div className="p-6 text-center text-sm text-ink-muted">No cases yet</div>}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-lg">Quick Actions</h2>
          <div className="grid gap-3">
            {[
              { to: '/advocate/consultations', label: 'Manage Consultations', icon: Calendar },
              { to: '/advocate/clients', label: 'View Clients', icon: Users },
              { to: '/advocate/earnings', label: 'View Earnings', icon: CreditCard },
              { to: '/advocate/reviews', label: 'My Reviews', icon: Star },
              { to: '/advocate/profile', label: 'Edit Profile', icon: Users },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="panel p-4 flex items-center gap-3 hover:border-chamber-300 hover:shadow-sm transition-all">
                <Icon className="h-5 w-5 text-chamber-600" />
                <span className="text-sm font-medium">{label}</span>
                <ArrowRight className="h-4 w-4 text-ink-muted ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
