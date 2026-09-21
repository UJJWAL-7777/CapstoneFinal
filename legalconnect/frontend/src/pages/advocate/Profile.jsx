import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { advocateService } from '../../services/advocateService.js';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import VerifiedBadge from '../../components/ui/VerifiedBadge.jsx';
import { Save, ExternalLink, ShieldCheck, Mail, Phone, Award } from 'lucide-react';
import { PRACTICE_AREAS } from '../../utils/constants.js';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Punjabi', 'Malayalam'];
const MODES = ['video', 'chat', 'in-person'];

export default function AdvocateProfile() {
  const { user, refetchUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    headline: '',
    bio: '',
    practiceAreas: [],
    experienceYears: 0,
    languages: [],
    consultationFee: 0,
    consultationModes: [],
    locationCity: '',
    locationState: '',
  });

  useEffect(() => {
    advocateService
      .getMyProfile()
      .then((data) => {
        const p = data?.profile || data;
        if (!p) return;
        setProfile(p);
        setForm({
          name: user?.name || p.user?.name || '',
          phone: user?.phone || p.user?.phone || '',
          headline: p.headline || '',
          bio: p.bio || '',
          practiceAreas: p.practiceAreas || [],
          experienceYears: p.experienceYears ?? 0,
          languages: p.languages || [],
          consultationFee: p.consultationFee ?? 0,
          consultationModes: p.consultationModes || ['video', 'chat'],
          locationCity: p.location?.city || '',
          locationState: p.location?.state || '',
        });
      })
      .catch((err) => {
        console.error('Error fetching advocate profile:', err);
        toast.error('Failed to load advocate profile');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = (key, val) => {
    setForm((p) => {
      const arr = p[key] || [];
      return { ...p, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/profiles/me', { name: form.name, phone: form.phone }),
        advocateService.updateMyProfile({
          headline: form.headline,
          bio: form.bio,
          practiceAreas: form.practiceAreas,
          experienceYears: +form.experienceYears,
          languages: form.languages,
          consultationFee: +form.consultationFee,
          consultationModes: form.consultationModes,
          location: { city: form.locationCity, state: form.locationState },
        }),
      ]);
      await refetchUser?.();
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to save profile. Please check the inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" />
      </div>
    );
  }

  const publicProfileUrl = `/client/advocates/${profile?._id || user?._id}`;

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Advocate Profile</h1>
          <p className="text-ink-soft text-sm mt-0.5">Customize your public practice presence, fees, and areas of expertise</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={publicProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Public Profile
          </Link>
          <Button onClick={handleSave} loading={saving} size="sm" className="gap-1.5 shadow-sm">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Header Profile Identity Card */}
      <div className="panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={form.name || user?.name} src={user?.avatar?.url} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-ink">{form.name || user?.name}</h2>
              {profile?.verificationStatus === 'Verified' && <VerifiedBadge />}
            </div>
            <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-2">
              <Mail className="h-3 w-3 inline" /> {user?.email}
              {form.phone && (
                <>
                  <span>•</span>
                  <span><Phone className="h-3 w-3 inline" /> {form.phone}</span>
                </>
              )}
            </p>
            {profile?.barCouncilNumber && (
              <p className="text-xs text-chamber-700 font-medium mt-1 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-chamber-600" />
                <span>Bar Council: <strong>{profile.barCouncilNumber}</strong> ({profile.barCouncilState || 'State Bar'})</span>
              </p>
            )}
          </div>
        </div>

        <div>
          {profile?.verificationStatus === 'Verified' ? (
            <div className="rounded-xl px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Identity & Bar Verified
            </div>
          ) : (
            <div className="rounded-xl px-3 py-1.5 bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
              Verification: <strong>{profile?.verificationStatus || 'Pending Review'}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form Panel */}
      <div className="panel p-6 space-y-5">
        <h3 className="text-base font-semibold text-ink border-b border-line pb-2">Professional Details</h3>

        {/* Basic Name & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-base"
              placeholder="Adv. Full Name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="input-base"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Headline</label>
          <input
            value={form.headline}
            onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
            className="input-base"
            placeholder="e.g. Senior Criminal & Family Law Advocate with 10+ years experience"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Bio & Practice Overview</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            className="input-base resize-none"
            placeholder="Tell prospective clients about your legal expertise, trial experience, and client commitment..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Experience (years)</label>
            <input
              type="number"
              min="0"
              value={form.experienceYears}
              onChange={(e) => setForm((p) => ({ ...p, experienceYears: e.target.value }))}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Consultation Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={form.consultationFee}
              onChange={(e) => setForm((p) => ({ ...p, consultationFee: e.target.value }))}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">City</label>
            <input
              value={form.locationCity}
              onChange={(e) => setForm((p) => ({ ...p, locationCity: e.target.value }))}
              className="input-base"
              placeholder="e.g. Mumbai, New Delhi, Patna"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">State</label>
            <input
              value={form.locationState}
              onChange={(e) => setForm((p) => ({ ...p, locationState: e.target.value }))}
              className="input-base"
              placeholder="e.g. Maharashtra, Delhi, Bihar"
            />
          </div>
        </div>

        {/* Practice Areas */}
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            Practice Areas ({form.practiceAreas.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {PRACTICE_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggle('practiceAreas', area)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  form.practiceAreas?.includes(area)
                    ? 'border-chamber-600 bg-chamber-50 text-chamber-800 font-semibold ring-1 ring-chamber-500/20'
                    : 'border-line text-ink-muted hover:border-chamber-300'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            Spoken Languages ({form.languages.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggle('languages', lang)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  form.languages?.map((l) => l.toLowerCase()).includes(lang.toLowerCase())
                    ? 'border-chamber-600 bg-chamber-50 text-chamber-800 font-semibold ring-1 ring-chamber-500/20'
                    : 'border-line text-ink-muted hover:border-chamber-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Consultation Modes */}
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            Supported Consultation Modes
          </label>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => toggle('consultationModes', mode)}
                className={`rounded-xl border py-2.5 text-sm font-medium capitalize transition-colors ${
                  form.consultationModes?.includes(mode)
                    ? 'border-chamber-600 bg-chamber-50 text-chamber-800 font-semibold ring-2 ring-chamber-500/20'
                    : 'border-line text-ink-muted hover:border-chamber-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
