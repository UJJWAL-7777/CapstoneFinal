import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Scale, FileText, Bell, MessageSquare, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { consultationService } from '../../services/consultationService.js';
import { caseService } from '../../services/caseService.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import StatCard from '../../components/ui/StatCard.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { format } from 'date-fns';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [consultations, setConsultations] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consultationService.list({ status: 'Confirmed', limit: 3 }),
      caseService.list({ limit: 5 }),
    ]).then(([cons, cas]) => {
      setConsultations(cons.consultations || []);
      setCases(cas.cases || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const upcomingConsultation = consultations[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl">Good {getGreeting()}, {user.name.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-ink-soft">Here's what's happening with your legal matters.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Active Cases" value={cases.length} icon={Scale} color="chamber" />
        <StatCard title="Consultations" value={consultations.length} icon={Calendar} color="brass" />
        <StatCard title="Notifications" value={unreadCount} icon={Bell} color="info" />
        <StatCard title="Documents" value="—" icon={FileText} color="success" subtitle="View all" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming consultation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Upcoming Consultation</h2>
            <Link to="/client/consultations" className="text-sm text-chamber-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? <SkeletonCard /> : upcomingConsultation ? (
            <div className="panel p-5">
              <div className="flex items-center gap-4">
                <Avatar name={upcomingConsultation.advocate?.name} src={upcomingConsultation.advocate?.avatar?.url} size="lg" />
                <div className="flex-1">
                  <p className="font-semibold text-ink">{upcomingConsultation.advocate?.name}</p>
                  <p className="text-sm text-ink-soft">
                    {format(new Date(upcomingConsultation.date), 'EEEE, MMM d')} at {upcomingConsultation.timeSlot}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3" /> Confirmed
                    </Badge>
                    <Badge variant="default">{upcomingConsultation.mode}</Badge>
                  </div>
                </div>
                {upcomingConsultation.mode === 'video' && (
                  <Button to={`/client/consultations/${upcomingConsultation._id}/video`} variant="primary" size="sm">
                    Join Call
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="panel p-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-ink-muted mb-3" />
              <p className="text-ink-soft">No upcoming consultations</p>
              <Button to="/client/advocates" size="sm" className="mt-4">Find an Advocate</Button>
            </div>
          )}

          {/* Active Cases */}
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-lg">Active Cases</h2>
            <Link to="/client/cases" className="text-sm text-chamber-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? <SkeletonCard /> : cases.length > 0 ? (
            <div className="panel divide-y divide-line">
              {cases.slice(0, 3).map((c) => (
                <Link key={c._id} to={`/client/cases/${c._id}`} className="flex items-center gap-4 p-4 hover:bg-paper transition-colors">
                  <Scale className="h-5 w-5 text-chamber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{c.title}</p>
                    <p className="text-xs text-ink-muted">{c.caseId} · {c.practiceArea}</p>
                  </div>
                  <Badge variant={c.status === 'Resolved' ? 'success' : 'primary'}>{c.status}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="panel p-8 text-center">
              <Scale className="mx-auto h-10 w-10 text-ink-muted mb-3" />
              <p className="text-ink-soft">No active cases yet</p>
            </div>
          )}
        </div>

        {/* Sidebar: Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Recent Notifications</h2>
            <Link to="/client/notifications" className="text-sm text-chamber-600 hover:underline">View all</Link>
          </div>
          <div className="panel divide-y divide-line">
            {notifications.slice(0, 5).map((n) => (
              <div key={n._id} className={`p-4 ${!n.isRead ? 'bg-chamber-50/50' : ''}`}>
                <p className="text-sm font-medium text-ink">{n.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">{n.message}</p>
                <p className="text-[10px] text-ink-muted mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-ink-muted">No notifications</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: '/client/advocates', label: 'Find Advocate', icon: Scale },
            { to: '/client/consultations', label: 'My Consultations', icon: Calendar },
            { to: '/client/cases', label: 'My Cases', icon: FileText },
            { to: '/client/messages', label: 'Messages', icon: MessageSquare },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="panel p-4 flex flex-col items-center gap-2 text-center hover:border-chamber-300 hover:shadow-md transition-all">
              <Icon className="h-6 w-6 text-chamber-600" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
