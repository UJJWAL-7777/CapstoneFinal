import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Award, Trophy, Star, CheckCircle2, Lock, TrendingUp, Calendar, ShieldCheck } from 'lucide-react';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { format } from 'date-fns';

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/advocates/${user._id}/badges`).then((r) => r.data.data).catch(() => null),
      api.get(`/advocates/${user._id}/achievements`).then((r) => r.data.data).catch(() => []),
    ]).then(([badgesData, achievementsData]) => {
      if (badgesData) {
        setBadges(badgesData.badges || (Array.isArray(badgesData) ? badgesData : []));
        setStats(badgesData.stats || {});
      }
      setAchievements(Array.isArray(achievementsData) ? achievementsData : []);
    }).finally(() => setLoading(false));
  }, [user._id]);

  const earnedBadges = badges.filter((b) => b.isEarned);
  const lockedBadges = badges.filter((b) => !b.isEarned);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-ink">Badges & Reputation</h1>
        <p className="text-ink-soft text-sm mt-0.5">
          Track verified credentials, reputation milestones, and public practice achievements
        </p>
      </div>

      {/* Practice Milestones Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Earned Badges"
          value={`${earnedBadges.length} / ${badges.length || 6}`}
          icon={Award}
          color="chamber"
        />
        <StatCard
          title="Completed Sessions"
          value={stats.completedConsultations ?? 0}
          icon={Calendar}
          color="brass"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate ?? 100}%`}
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Average Rating"
          value={`${stats.avgRating ?? '5.0'} ★`}
          icon={Star}
          color="info"
        />
      </div>

      {/* Earned Badges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Active Credentials & Badges ({earnedBadges.length})
          </h2>
          <span className="text-xs text-ink-muted">Displayed on your public profile</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" />
          </div>
        ) : earnedBadges.length === 0 ? (
          <div className="panel p-8 text-center space-y-2">
            <Award className="mx-auto h-12 w-12 text-ink-muted mb-2 opacity-50" />
            <p className="font-semibold text-ink">No badges earned yet</p>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Complete your profile verification and client consultations to unlock your first verified badge.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((b) => (
              <div
                key={b.type || b._id}
                className="panel p-5 relative flex flex-col justify-between border-chamber-200 bg-gradient-to-br from-white to-chamber-50/30 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span className="text-4xl p-2 rounded-2xl bg-chamber-100/50 shrink-0">
                    {b.icon || '🏅'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-ink text-sm truncate">{b.name}</h3>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">{b.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-ink-muted">
                  <Badge variant="success" size="xs">Unlocked</Badge>
                  {b.earnedAt && (
                    <span>Earned {format(new Date(b.earnedAt), 'MMM d, yyyy')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-Progress / Locked Badges Section */}
      {lockedBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Lock className="h-5 w-5 text-ink-muted" />
            Milestones In Progress ({lockedBadges.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedBadges.map((b) => (
              <div
                key={b.type || b._id}
                className="panel p-5 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity bg-paper/20"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-paper grayscale shrink-0">
                    {b.icon || '🔒'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-ink text-sm">{b.name}</h3>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">{b.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line space-y-1.5">
                  {b.progress && (
                    <div className="flex justify-between text-[11px] text-ink-muted font-medium">
                      <span>Progress</span>
                      <span>{b.progress.current} / {b.progress.threshold}</span>
                    </div>
                  )}
                  <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-chamber-600 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((b.progress?.current || 0) / (b.progress?.threshold || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Milestones Progress */}
      {achievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-chamber-600" />
            Consultation Milestone Goals
          </h2>
          <div className="panel p-5 space-y-4 shadow-sm divide-y divide-line">
            {achievements.map((a) => (
              <div key={a.label} className="pt-3 first:pt-0">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-ink flex items-center gap-2">
                    {a.unlocked && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    {a.label}
                  </span>
                  <span className="text-ink-muted font-mono">
                    {a.current || 0} / {a.target || a.milestone} Completed
                  </span>
                </div>
                <ProgressBar
                  value={a.current || 0}
                  max={a.target || a.milestone}
                  color={a.unlocked ? 'success' : 'chamber'}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
