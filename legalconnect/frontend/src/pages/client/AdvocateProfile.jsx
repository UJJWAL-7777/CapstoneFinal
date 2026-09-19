import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, MessageSquare, Video, Star, Award, Calendar } from 'lucide-react';
import { advocateService } from '../../services/advocateService.js';
import { reviewService } from '../../services/reviewService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import VerifiedBadge from '../../components/ui/VerifiedBadge.jsx';
import RatingStars from '../../components/ui/RatingStars.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { format } from 'date-fns';

export default function AdvocateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      advocateService.getProfile(id),
      reviewService.getAdvocateReviews(id, { limit: 5 }),
    ]).then(([profileData, reviewData]) => {
      setData(profileData);
      setReviews(reviewData.reviews || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
    </div>
  );

  if (!data) return <div className="panel p-12 text-center text-ink-muted">Advocate not found.</div>;

  const { user, profile, stats, badges } = data;
  const langsList = profile.languages?.join(', ') || '—';
  const modesList = profile.consultationModes?.join(', ') || '—';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="panel p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={user?.name} src={user?.avatar?.url} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl">{user?.name}</h1>
              {profile.verificationStatus === 'Verified' && <VerifiedBadge size="md" />}
            </div>
            <p className="text-ink-soft mt-1">{profile.headline || 'Legal Advocate'}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-muted">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{profile.experienceYears}+ years</span>
              {profile.location?.city && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location.city}, {profile.location.state}</span>}
              <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" />₹{profile.consultationFee?.toLocaleString()} / session</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.practiceAreas?.map((a) => <Badge key={a} variant="primary">{a}</Badge>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges?.map((b) => (
                <span key={b.type} title={b.description} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-paper border border-line">
                  {b.icon} {b.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="text-center">
              <p className="text-3xl font-bold text-ink">{stats?.avgRating?.toFixed(1) || '—'}</p>
              <RatingStars rating={stats?.avgRating || 0} size="sm" />
              <p className="text-xs text-ink-muted">{stats?.reviewCount || 0} reviews</p>
            </div>
            <Button onClick={() => navigate(`/client/book/${id}`)} size="lg" variant="primary">
              <Calendar className="h-4 w-4" /> Book Consultation
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {profile.bio && (
            <div className="panel p-5">
              <h2 className="text-lg mb-3">About</h2>
              <p className="text-ink-soft leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Qualifications */}
          {profile.qualifications?.length > 0 && (
            <div className="panel p-5">
              <h2 className="text-lg mb-3">Qualifications</h2>
              <div className="space-y-2">
                {profile.qualifications.map((q, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-chamber-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{q.degree}</p>
                      <p className="text-xs text-ink-muted">{q.institution} · {q.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg">Recent Reviews</h2>
              <div className="flex items-center gap-2">
                <RatingStars rating={stats?.avgRating || 0} />
                <span className="text-sm font-medium">{stats?.avgRating?.toFixed(1) || '—'}</span>
              </div>
            </div>

            {/* Rating breakdown */}
            {stats && (
              <div className="grid gap-2 mb-5 p-4 bg-paper rounded-xl">
                {[
                  { label: 'Communication', val: stats.avgCommunication },
                  { label: 'Professionalism', val: stats.avgProfessionalism },
                  { label: 'Responsiveness', val: stats.avgResponsiveness },
                ].map(({ label, val }) => (
                  <ProgressBar key={label} label={label} value={val || 0} max={5} size="sm" showValue={false} />
                ))}
              </div>
            )}

            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-line pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.client?.name} src={r.client?.avatar?.url} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.client?.name}</p>
                      <RatingStars rating={r.rating} size="sm" />
                    </div>
                    <p className="text-xs text-ink-muted">{format(new Date(r.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-ink-muted text-center py-4">No reviews yet</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-semibold mb-3">Consultation Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Fee</dt><dd className="font-medium">₹{profile.consultationFee?.toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Modes</dt><dd className="font-medium capitalize">{modesList}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Languages</dt><dd className="font-medium">{langsList}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Experience</dt><dd className="font-medium">{profile.experienceYears} yrs</dd></div>
            </dl>
            <Button onClick={() => navigate(`/client/book/${id}`)} className="w-full mt-4" size="md">
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
