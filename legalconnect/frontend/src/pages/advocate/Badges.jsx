import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Award, Trophy } from 'lucide-react';
import ProgressBar from '../../components/ui/ProgressBar.jsx';

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/advocates/${user._id}/badges`).then((r) => r.data.data),
      api.get(`/advocates/${user._id}/achievements`).then((r) => r.data.data),
    ]).then(([b, a]) => {
      setBadges(b || []);
      setAchievements(a || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user._id]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Badges & Achievements</h1>
        <p className="text-ink-soft mt-1">Earn badges by completing milestones and building your reputation.</p>
      </div>

      {/* Earned badges */}
      <div>
        <h2 className="text-lg mb-4">Earned Badges ({badges.length})</h2>
        {badges.length === 0 ? (
          <div className="panel p-10 text-center">
            <Award className="mx-auto h-12 w-12 text-ink-muted mb-3" />
            <p className="text-ink-muted">No badges earned yet. Complete consultations and cases to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map((b) => (
              <div key={b.type || b._id} className="panel p-5 text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl">{b.icon}</span>
                <p className="mt-2 font-semibold text-sm">{b.name}</p>
                <p className="text-xs text-ink-muted mt-1">{b.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements progress */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-lg mb-4">Progress</h2>
          <div className="panel p-5 space-y-5">
            {achievements.map((a) => (
              <ProgressBar key={a.label} label={a.label} value={a.current} max={a.target} color="chamber" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
