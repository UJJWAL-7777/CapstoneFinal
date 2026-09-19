import { useState } from 'react';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';

export default function ClientSettings() {
  const toast = useToast();
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPwd: false });
  const [saving, setSaving] = useState(false);

  const handlePwd = async (e) => {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) { toast.error('Passwords do not match'); return; }
    if (pwd.newPwd.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success('Password updated successfully');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (e) {
      toast.error(e.response?.data?.error?.message || 'Failed to update password');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <h1 className="text-2xl">Settings</h1>

      <div className="panel p-6">
        <div className="flex items-center gap-3 mb-5">
          <Lock className="h-5 w-5 text-chamber-600" />
          <h2 className="text-lg font-semibold">Change Password</h2>
        </div>
        <form onSubmit={handlePwd} className="space-y-4">
          {[
            { key: 'current', label: 'Current Password', showKey: 'current' },
            { key: 'newPwd', label: 'New Password', showKey: 'newPwd' },
            { key: 'confirm', label: 'Confirm New Password', showKey: 'newPwd' },
          ].map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  value={pwd[key]}
                  onChange={(e) => setPwd((p) => ({ ...p, [key]: e.target.value }))}
                  className="input-base pr-10"
                  required
                />
                {(key === 'current' || key === 'newPwd') && (
                  <button type="button" onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
                    {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" /> Update Password
          </Button>
        </form>
      </div>

      <div className="panel p-6">
        <h2 className="text-lg font-semibold mb-3">Danger Zone</h2>
        <p className="text-sm text-ink-soft mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button className="text-sm text-danger-500 border border-danger-500/30 rounded-lg px-4 py-2 hover:bg-danger-50 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
