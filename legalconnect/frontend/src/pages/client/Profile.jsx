import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { advocateService } from '../../services/advocateService.js';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';

export default function ClientProfile() {
  const { user, refetchUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', phone: '', bio: '', occupation: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', bio: '', occupation: '' });
      api.get('/profiles/client/me').then((r) => {
        const p = r.data.data;
        setForm((prev) => ({ ...prev, bio: p.bio || '', occupation: p.occupation || '' }));
      }).catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/profiles/me', { name: form.name, phone: form.phone }),
        api.put('/profiles/client/me', { bio: form.bio, occupation: form.occupation }),
      ]);
      await refetchUser?.();
      toast.success('Profile updated');
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-2xl">My Profile</h1>

      <div className="panel p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} src={user?.avatar?.url} size="xl" />
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-ink-muted">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input-base" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Occupation</label>
            <input value={form.occupation} onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))} className="input-base" placeholder="e.g. Software Engineer" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink mb-1.5">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} className="input-base resize-none" placeholder="A brief description about yourself..." />
          </div>
        </div>

        <div className="mt-5">
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="font-semibold mb-3">Account Info</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2"><dt className="text-ink-muted w-24">Email:</dt><dd>{user?.email}</dd></div>
          <div className="flex gap-2"><dt className="text-ink-muted w-24">Role:</dt><dd className="capitalize">{user?.role}</dd></div>
          <div className="flex gap-2"><dt className="text-ink-muted w-24">Status:</dt><dd className="capitalize">{user?.status}</dd></div>
        </dl>
      </div>
    </div>
  );
}
