import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Scale, Users, CreditCard, Star, TrendingUp, ArrowRight, Clock, Plus, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { consultationService } from '../../services/consultationService.js';
import { caseService } from '../../services/caseService.js';
import { paymentService } from '../../services/paymentService.js';
import { advocateService } from '../../services/advocateService.js';
import StatCard from '../../components/ui/StatCard.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { format } from 'date-fns';

const STATUS_COLORS = { Pending: 'warning', Confirmed: 'success', Completed: 'default', Cancelled: 'danger' };

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [cases, setCases] = useState([]);
  const [profile, setProfile] = useState(null);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consultationService.list({ limit: 5 }),
      caseService.list({ limit: 5 }),
      paymentService.list({ limit: 1 }),
      advocateService.getMyProfile().catch(() => null),
    ]).then(([cons, cas, pay, prof]) => {
      setConsultations(cons.consultations || []);
      setCases(cas.cases || []);
      setRevenue(pay.totalRevenue || 0);
      if (prof?.profile) setProfile(prof.profile);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pending = consultations.filter((c) => c.status === 'Pending').length;
  const upcoming = consultations.filter((c) => c.status === 'Confirmed' && new Date(c.date) >= new Date()).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-ink-soft text-sm mt-0.5">Here's your law practice overview for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button to="/advocate/cases" variant="primary" size="sm" className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" /> Open New Case
          </Button>
        </div>
      </div>

      {/* Verification status notice if pending */}
      {profile && profile.verificationStatus !== 'Verified' && (
        <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-semibold">Bar Council Verification Status: {profile.verificationStatus || 'Pending'}</p>
            <p className="text-amber-800 mt-0.5">
              Your credentials (Bar Council No: {profile.barCouncilNumber || 'Submitted'}) are under review. You can continue booking consultations and managing case files normally.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Pending Inquiries" value={pending} icon={Clock} color="warning" />
        <StatCard title="Upcoming Sessions" value={upcoming} icon={Calendar} color="chamber" />
        <StatCard title="Active Cases" value={cases.length} icon={Scale} color="info" />
        <StatCard title="Net Earnings" value={`₹${revenue.toLocaleString()}`} icon={CreditCard} color="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent consultations & cases */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consultations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Recent Consultations</h2>
              <Link to="/advocate/consultations" className="text-xs text-chamber-700 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {loading ? <SkeletonCard /> : consultations.length === 0 ? (
              <div className="panel p-8 text-center text-ink-muted text-sm">No consultation requests yet</div>
            ) : (
              <div className="panel divide-y divide-line shadow-sm overflow-hidden">
                {consultations.map((c) => (
                  <div key={c._id} className="flex items-center gap-4 p-4 hover:bg-paper/40 transition-colors">
                    <Avatar name={c.client?.name} src={c.client?.avatar?.url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink truncate">{c.client?.name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {format(new Date(c.date), 'MMM d')} • {c.timeSlot} • <span className="capitalize">{c.mode}</span>
                      </p>
                    </div>
                    <Badge variant={STATUS_COLORS[c.status] || 'default'} size="xs">{c.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent cases */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Active Case Matters</h2>
              <Link to="/advocate/cases" className="text-xs text-chamber-700 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {loading ? <SkeletonCard /> : (
              <div className="panel divide-y divide-line shadow-sm overflow-hidden">
                {cases.slice(0, 3).map((c) => (
                  <Link key={c._id} to={`/advocate/cases/${c._id}`} className="flex items-center gap-3 p-4 hover:bg-paper/40 transition-colors">
                    <div className="p-1.5 rounded-lg bg-chamber-50 text-chamber-700 shrink-0">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink truncate">{c.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {c.client?.name} • {c.practiceArea}
                        {c.courtName && ` • ${c.courtName}`}
                      </p>
                    </div>
                    <Badge variant="primary" size="xs">{c.status}</Badge>
                  </Link>
                ))}
                {cases.length === 0 && <div className="p-8 text-center text-sm text-ink-muted">No legal cases opened yet</div>}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink">Quick Actions</h2>
          <div className="grid gap-3">
            {[
              { to: '/advocate/cases', label: 'Open New Case', icon: Plus },
              { to: '/advocate/consultations', label: 'Manage Inquiries', icon: Calendar },
              { to: '/advocate/calendar', label: 'Set Availability Slots', icon: Clock },
              { to: '/advocate/clients', label: 'Client Directory', icon: Users },
              { to: '/advocate/earnings', label: 'View Revenue & Receipts', icon: CreditCard },
              { to: '/advocate/reviews', label: 'Client Feedback & Reviews', icon: Star },
              { to: '/advocate/profile', label: 'Edit Public Profile', icon: ShieldCheck },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="panel p-3.5 flex items-center gap-3 hover:border-chamber-300 hover:shadow-xs transition-all">
                <div className="p-2 rounded-lg bg-chamber-50 text-chamber-700">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-ink">{label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-muted ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
