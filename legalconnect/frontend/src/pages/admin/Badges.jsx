import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Award, Plus } from 'lucide-react';

const BADGE_TYPES = [
  { type: 'top_rated', name: 'Top Rated', icon: '⭐', description: 'Avg rating ≥ 4.5 with 10+ reviews' },
  { type: 'verified_expert', name: 'Verified Expert', icon: '✅', description: 'Bar Council verified' },
  { type: 'quick_responder', name: 'Quick Responder', icon: '⚡', description: 'Responds within 2 hours' },
  { type: 'case_winner', name: 'Case Winner', icon: '🏆', description: '10+ resolved cases' },
  { type: 'client_favorite', name: 'Client Favorite', icon: '❤️', description: '50+ consultations completed' },
  { type: 'community_contributor', name: 'Community Contributor', icon: '🤝', description: 'Active in platform community' },
];

export default function AdminBadges() {
  const toast = useToast();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', badgeType: BADGE_TYPES[0].type });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    adminService.getRecentBadgeGrants?.().then((d) => setGrants(d || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGrant = async () => {
    if (!form.userId.trim()) { toast.error('Please enter a user ID'); return; }
    setSaving(true);
    try {
      await adminService.grantBadge(form.userId, form.badgeType);
      toast.success('Badge granted!');
      setShowModal(false);
      setForm({ userId: '', badgeType: BADGE_TYPES[0].type });
      load();
    } catch { toast.error('Failed to grant badge'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Badges</h1>
          <p className="text-ink-soft mt-1">Manage advocate achievement badges</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> Grant Badge</Button>
      </div>

      {/* Badge types */}
      <div>
        <h2 className="text-lg mb-4">Available Badges</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_TYPES.map((b) => (
            <div key={b.type} className="panel p-5">
              <span className="text-3xl">{b.icon}</span>
              <h3 className="mt-2 font-semibold">{b.name}</h3>
              <p className="text-sm text-ink-muted mt-1">{b.description}</p>
              <Badge variant="default" className="mt-2 text-xs">{b.type}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Grant badge modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Grant Badge"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleGrant} loading={saving}>Grant Badge</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Advocate User ID</label>
            <input value={form.userId} onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))} placeholder="Paste user _id from database" className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Badge Type</label>
            <select value={form.badgeType} onChange={(e) => setForm((p) => ({ ...p, badgeType: e.target.value }))} className="input-base">
              {BADGE_TYPES.map((b) => <option key={b.type} value={b.type}>{b.icon} {b.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
