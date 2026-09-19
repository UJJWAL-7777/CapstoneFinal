import { useEffect, useState } from 'react';
import { advocateService } from '../../services/advocateService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import VerifiedBadge from '../../components/ui/VerifiedBadge.jsx';
import { Save, Plus, X } from 'lucide-react';
import { PRACTICE_AREAS } from '../../utils/constants.js';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'];
const MODES = ['video', 'chat', 'in-person'];

export default function AdvocateProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    advocateService.getMyProfile().then((p) => {
      setProfile(p.profile);
      setForm({
        headline: p.profile?.headline || '',
        bio: p.profile?.bio || '',
        practiceAreas: p.profile?.practiceAreas || [],
        experienceYears: p.profile?.experienceYears || 0,
        languages: p.profile?.languages || [],
        consultationFee: p.profile?.consultationFee || 0,
        consultationModes: p.profile?.consultationModes || [],
        locationCity: p.profile?.location?.city || '',
        locationState: p.profile?.location?.state || '',
      });
    }).catch(() => {});
  }, []);

  const toggle = (key, val) => {
    setForm((p) => {
      const arr = p[key] || [];
      return { ...p, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await advocateService.updateMyProfile({
        headline: form.headline,
        bio: form.bio,
        practiceAreas: form.practiceAreas,
        experienceYears: +form.experienceYears,
        languages: form.languages,
        consultationFee: +form.consultationFee,
        consultationModes: form.consultationModes,
        location: { city: form.locationCity, state: form.locationState },
      });
      toast.success('Profile updated');
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  if (!profile && !form.headline !== undefined) return (
    <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" /></div>
  );

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">My Profile</h1>
        <Button onClick={handleSave} loading={saving}><Save className="h-4 w-4" /> Save Changes</Button>
      </div>

      {/* Header */}
      <div className="panel p-6 flex items-center gap-4">
        <Avatar name={user?.name} src={user?.avatar?.url} size="xl" />
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-ink-muted">{user?.email}</p>
          {profile?.verificationStatus === 'Verified' && <VerifiedBadge className="mt-1" />}
          {profile?.verificationStatus !== 'Verified' && (
            <p className="text-xs text-amber-600 mt-1">Verification status: <strong>{profile?.verificationStatus || 'Pending'}</strong></p>
          )}
        </div>
      </div>

      <div className="panel p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Headline</label>
          <input value={form.headline || ''} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} className="input-base" placeholder="e.g. Senior Criminal Lawyer with 10+ years experience" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Bio</label>
          <textarea rows={4} value={form.bio || ''} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} className="input-base resize-none" placeholder="Tell clients about your background and approach..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Experience (years)</label>
            <input type="number" min="0" value={form.experienceYears || ''} onChange={(e) => setForm((p) => ({ ...p, experienceYears: e.target.value }))} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Consultation Fee (₹)</label>
            <input type="number" min="0" value={form.consultationFee || ''} onChange={(e) => setForm((p) => ({ ...p, consultationFee: e.target.value }))} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">City</label>
            <input value={form.locationCity || ''} onChange={(e) => setForm((p) => ({ ...p, locationCity: e.target.value }))} className="input-base" placeholder="e.g. Mumbai" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">State</label>
            <input value={form.locationState || ''} onChange={(e) => setForm((p) => ({ ...p, locationState: e.target.value }))} className="input-base" placeholder="e.g. Maharashtra" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Practice Areas</label>
          <div className="flex flex-wrap gap-2">
            {PRACTICE_AREAS.map((area) => (
              <button key={area} type="button" onClick={() => toggle('practiceAreas', area)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${form.practiceAreas?.includes(area) ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line text-ink-muted hover:border-chamber-300'}`}>
                {area}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Languages</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button key={lang} type="button" onClick={() => toggle('languages', lang)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${form.languages?.includes(lang) ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line text-ink-muted hover:border-chamber-300'}`}>
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Consultation Modes</label>
          <div className="flex gap-3">
            {MODES.map((mode) => (
              <button key={mode} type="button" onClick={() => toggle('consultationModes', mode)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition-colors ${form.consultationModes?.includes(mode) ? 'border-chamber-500 bg-chamber-50 text-chamber-700' : 'border-line text-ink-muted hover:border-chamber-300'}`}>
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
