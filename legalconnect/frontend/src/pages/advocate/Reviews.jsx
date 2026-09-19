import { useEffect, useState } from 'react';
import { reviewService } from '../../services/reviewService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import RatingStars from '../../components/ui/RatingStars.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { Star } from 'lucide-react';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { format } from 'date-fns';

export default function Reviews() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ reviews: [], stats: {}, total: 0 });
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null); // review being responded to
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    reviewService.getAdvocateReviews(user._id, { limit: 50 }).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [user._id]);

  const handleRespond = async () => {
    if (!response.trim()) return;
    setSaving(true);
    try {
      await reviewService.respond(responding._id, response);
      setData((p) => ({
        ...p,
        reviews: p.reviews.map((r) => r._id === responding._id ? { ...r, advocateResponse: response } : r),
      }));
      setResponding(null);
      setResponse('');
      toast.success('Response posted');
    } catch { toast.error('Failed to post response'); }
    finally { setSaving(false); }
  };

  const { stats } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">My Reviews</h1>
        <p className="text-ink-soft mt-1">{data.total} verified reviews from clients</p>
      </div>

      {/* Stats */}
      {stats?.avgRating && (
        <div className="panel p-5 flex items-center gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold">{Number(stats.avgRating).toFixed(1)}</p>
            <RatingStars rating={stats.avgRating} size="md" />
            <p className="text-xs text-ink-muted mt-1">{data.total} reviews</p>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Communication', val: stats.avgCommunication },
              { label: 'Professionalism', val: stats.avgProfessionalism },
              { label: 'Responsiveness', val: stats.avgResponsiveness },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xl font-bold">{val ? Number(val).toFixed(1) : '—'}</p>
                <p className="text-xs text-ink-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" /></div>
      ) : data.reviews.length === 0 ? (
        <div className="panel p-12 text-center">
          <Star className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm text-ink-muted mt-1">Reviews appear after clients complete consultations.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {data.reviews.map((r) => (
            <div key={r._id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar name={r.client?.name} src={r.client?.avatar?.url} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{r.client?.name}</p>
                      <RatingStars rating={r.rating} size="sm" />
                    </div>
                    <p className="text-xs text-ink-muted">{format(new Date(r.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}

                  {r.advocateResponse ? (
                    <div className="mt-3 rounded-xl bg-chamber-50 border border-chamber-100 p-3">
                      <p className="text-xs font-semibold text-chamber-700 mb-1">Your response</p>
                      <p className="text-sm text-ink-soft">{r.advocateResponse}</p>
                    </div>
                  ) : (
                    <button onClick={() => { setResponding(r); setResponse(''); }} className="mt-2 text-xs text-chamber-600 hover:underline">
                      Respond to this review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!responding} onClose={() => setResponding(null)} title="Respond to Review"
        footer={<><Button variant="secondary" onClick={() => setResponding(null)}>Cancel</Button><Button onClick={handleRespond} loading={saving}>Post Response</Button></>}>
        <p className="text-sm text-ink-muted mb-3">"{responding?.comment}"</p>
        <textarea rows={4} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Write a professional response..." className="input-base resize-none w-full" />
      </Modal>
    </div>
  );
}
