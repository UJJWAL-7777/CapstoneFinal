import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Award, Plus, Trash2, Search, CheckCircle2, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const BADGE_TYPES = [
  { type: 'top_rated', name: 'Top Rated', icon: '⭐', description: 'Avg rating ≥ 4.5 with 10+ reviews' },
  { type: 'verified_expert', name: 'Verified Expert', icon: '✅', description: 'Bar Council credentials authenticated' },
  { type: 'quick_responder', name: 'Quick Responder', icon: '⚡', description: 'Consistently responds to client matters within 2 hours' },
  { type: 'case_winner', name: 'Case Champion', icon: '🏆', description: '10+ successfully resolved client court cases' },
  { type: 'client_favorite', name: 'Client Favorite', icon: '❤️', description: '50+ completed consultations with stellar feedback' },
  { type: 'community_contributor', name: 'Community Contributor', icon: '🤝', description: 'Active contributor in legal pro bono forums' },
];

export default function AdminBadges() {
  const toast = useToast();
  const [grants, setGrants] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdvocateId, setSelectedAdvocateId] = useState('');
  const [selectedBadgeType, setSelectedBadgeType] = useState(BADGE_TYPES[0].type);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [grantsData, advData] = await Promise.all([
        adminService.getGrantedBadges(),
        adminService.getAdvocates({ limit: 100 }),
      ]);
      setGrants(grantsData || []);
      const advList = advData.advocates || [];
      setAdvocates(advList);
      if (advList.length > 0 && !selectedAdvocateId) {
        setSelectedAdvocateId(advList[0].user?._id || advList[0]._id);
      }
    } catch (err) {
      console.error('Failed to load badges data:', err);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGrant = async () => {
    if (!selectedAdvocateId) {
      toast.error('Please select an advocate');
      return;
    }
    setSaving(true);
    try {
      await adminService.grantBadge(selectedAdvocateId, selectedBadgeType);
      toast.success('Badge successfully awarded!');
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to grant badge:', err);
      toast.error('Failed to grant badge');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (id, userName, badgeName) => {
    if (!window.confirm(`Are you sure you want to revoke "${badgeName}" from ${userName}?`)) return;
    try {
      await adminService.revokeBadge(id);
      toast.success('Badge revoked');
      setGrants((p) => p.filter((g) => g._id !== id));
    } catch (err) {
      console.error('Failed to revoke badge:', err);
      toast.error('Failed to revoke badge');
    }
  };

  const filteredGrants = grants.filter((g) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      g.user?.name?.toLowerCase().includes(s) ||
      g.user?.email?.toLowerCase().includes(s) ||
      g.badge?.name?.toLowerCase().includes(s) ||
      g.badge?.type?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Award className="h-6 w-6 text-chamber-700" /> Badges & Credentials Management
          </h1>
          <p className="text-ink-soft text-sm mt-0.5">
            Authorize and award professional trust credentials and milestones to advocates
          </p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" /> Grant Badge
        </Button>
      </div>

      {/* Available Platform Badge Types */}
      <div>
        <h2 className="text-base font-bold text-ink mb-3">Available Credential Badges</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_TYPES.map((b) => (
            <div key={b.type} className="panel p-5 flex flex-col justify-between hover:border-chamber-300 transition-colors shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{b.icon}</span>
                  <Badge variant="default" className="text-[10px] uppercase tracking-wider font-semibold">
                    {b.type}
                  </Badge>
                </div>
                <h3 className="mt-3 font-bold text-ink text-sm">{b.name}</h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Awarded Badges Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Awarded Credentials History ({grants.length})</h2>
            <p className="text-xs text-ink-muted mt-0.5">Active credentials granted to advocates across the platform</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
            <input
              type="text"
              placeholder="Search advocate or badge..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-8 py-1.5 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="panel p-8 text-center text-sm text-ink-muted">Loading credentials...</div>
        ) : filteredGrants.length === 0 ? (
          <div className="panel p-10 text-center space-y-2">
            <Award className="mx-auto h-8 w-8 text-ink-muted opacity-40" />
            <p className="text-sm font-semibold text-ink">No credentials found</p>
            <p className="text-xs text-ink-muted">Click "Grant Badge" above to bestow credentials upon an advocate.</p>
          </div>
        ) : (
          <div className="panel overflow-hidden border border-line">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Advocate</th>
                  <th>Awarded Badge</th>
                  <th>Type</th>
                  <th>Awarded Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrants.map((g) => (
                  <tr key={g._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={g.user?.name} src={g.user?.avatar?.url} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-ink truncate">{g.user?.name || 'Advocate'}</p>
                          <p className="text-[11px] text-ink-muted truncate">{g.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{g.badge?.icon || '⭐'}</span>
                        <span className="font-semibold text-xs text-ink">{g.badge?.name || 'Badge'}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant="primary" size="xs">
                        {g.badge?.type || 'credential'}
                      </Badge>
                    </td>
                    <td className="text-xs text-ink-muted">
                      {format(new Date(g.createdAt || Date.now()), 'MMM d, yyyy')}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleRevoke(g._id, g.user?.name, g.badge?.name)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 hover:underline"
                        title="Revoke Badge"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant Badge Modal with Searchable Advocate Selector */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Grant Trust Credential Badge"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleGrant} loading={saving} className="gap-1.5 shadow-sm">
              <CheckCircle2 className="h-4 w-4" /> Grant Badge
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Select Advocate
            </label>
            <select
              value={selectedAdvocateId}
              onChange={(e) => setSelectedAdvocateId(e.target.value)}
              className="input-base text-sm"
            >
              {advocates.map((adv) => {
                const uId = adv.user?._id || adv._id;
                const name = adv.user?.name || 'Advocate';
                const email = adv.user?.email || '';
                const bar = adv.barCouncilNumber ? ` • Bar: ${adv.barCouncilNumber}` : '';
                return (
                  <option key={uId} value={uId}>
                    {name} ({email}){bar}
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-ink-muted mt-1">
              Select any verified or active advocate from the platform registry.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Badge Type to Award
            </label>
            <select
              value={selectedBadgeType}
              onChange={(e) => setSelectedBadgeType(e.target.value)}
              className="input-base text-sm"
            >
              {BADGE_TYPES.map((b) => (
                <option key={b.type} value={b.type}>
                  {b.icon} {b.name} — {b.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
