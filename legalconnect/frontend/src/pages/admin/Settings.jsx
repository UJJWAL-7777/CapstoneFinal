import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import {
  Settings as SettingsIcon,
  Percent,
  IndianRupee,
  Clock,
  AlertTriangle,
  Megaphone,
  Mail,
  Phone,
  Save,
  ShieldAlert,
  CheckCircle2,
  Server,
} from 'lucide-react';

export default function AdminSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    platformCommissionPercent: 10,
    minConsultationFee: 100,
    escrowHoldHours: 24,
    maintenanceMode: false,
    announcementBanner: {
      active: false,
      message: '',
      type: 'info',
    },
    supportEmail: 'support@legalconnect.local',
    supportPhone: '+91 1800 123 4567',
  });

  useEffect(() => {
    adminService
      .getSettings()
      .then((data) => {
        if (data) {
          setForm({
            platformCommissionPercent: data.platformCommissionPercent ?? 10,
            minConsultationFee: data.minConsultationFee ?? 100,
            escrowHoldHours: data.escrowHoldHours ?? 24,
            maintenanceMode: Boolean(data.maintenanceMode),
            announcementBanner: {
              active: Boolean(data.announcementBanner?.active),
              message: data.announcementBanner?.message || '',
              type: data.announcementBanner?.type || 'info',
            },
            supportEmail: data.supportEmail || 'support@legalconnect.local',
            supportPhone: data.supportPhone || '+91 1800 123 4567',
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load platform settings:', err);
        toast.error('Failed to load settings');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(form);
      toast.success('Platform settings updated successfully');
    } catch (err) {
      console.error('Failed to update settings:', err);
      toast.error('Failed to update platform settings');
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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-chamber-700" /> Platform Settings
          </h1>
          <p className="text-ink-soft text-sm mt-0.5">
            Configure system parameters, escrow rules, fee commissions, and announcement banners
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} size="sm" className="gap-1.5 shadow-sm">
          <Save className="h-4 w-4" /> Save Configuration
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial & Fee Rules */}
        <div className="panel p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Percent className="h-5 w-5 text-chamber-700" />
            <h2 className="text-base font-bold text-ink">Financial & Commission Rules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Platform Commission ({form.platformCommissionPercent}%)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={form.platformCommissionPercent}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, platformCommissionPercent: Number(e.target.value) }))
                  }
                  className="w-full accent-chamber-600"
                />
                <div className="flex justify-between text-[11px] text-ink-muted">
                  <span>0% (Free)</span>
                  <span className="font-bold text-chamber-800">{form.platformCommissionPercent}%</span>
                  <span>30% Max</span>
                </div>
              </div>
              <p className="text-[11px] text-ink-muted mt-1.5">
                Deducted from gross booking fees before advocate release.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Min. Consultation Fee (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  type="number"
                  min="0"
                  value={form.minConsultationFee}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, minConsultationFee: Number(e.target.value) }))
                  }
                  className="input-base pl-9 text-sm"
                />
              </div>
              <p className="text-[11px] text-ink-muted mt-1.5">
                Floor fee required for advocates creating consultation profiles.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Escrow Auto-Release (Hours)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={form.escrowHoldHours}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, escrowHoldHours: Number(e.target.value) }))
                  }
                  className="input-base pl-9 text-sm"
                />
              </div>
              <p className="text-[11px] text-ink-muted mt-1.5">
                Hours after consultation completion before advocate payout is eligible.
              </p>
            </div>
          </div>
        </div>

        {/* System & Maintenance Mode */}
        <div className="panel p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Server className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-ink">System State & Access Control</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-line bg-paper/30">
            <div>
              <p className="text-sm font-bold text-ink flex items-center gap-2">
                Maintenance Mode
                {form.maintenanceMode ? (
                  <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">
                    ACTIVE
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    OPERATIONAL
                  </span>
                )}
              </p>
              <p className="text-xs text-ink-muted mt-0.5 max-w-lg">
                When active, non-admin users will see a maintenance notice preventing bookings or case edits during scheduled system upgrades.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.maintenanceMode ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  form.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Public Announcement Broadcast Banner */}
        <div className="panel p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-chamber-700" />
              <h2 className="text-base font-bold text-ink">Platform Announcement Banner</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.announcementBanner.active}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    announcementBanner: { ...p.announcementBanner, active: e.target.checked },
                  }))
                }
                className="rounded text-chamber-600"
              />
              Enable Banner
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Banner Message Text
              </label>
              <input
                type="text"
                placeholder="e.g. Scheduled maintenance on Sunday, 2:00 AM IST. Court filing features will remain active."
                value={form.announcementBanner.message}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    announcementBanner: { ...p.announcementBanner, message: e.target.value },
                  }))
                }
                className="input-base text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Banner Style
              </label>
              <select
                value={form.announcementBanner.type}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    announcementBanner: { ...p.announcementBanner, type: e.target.value },
                  }))
                }
                className="input-base text-sm"
              >
                <option value="info">Info (Blue)</option>
                <option value="warning">Warning (Amber)</option>
                <option value="success">Success (Emerald)</option>
                <option value="danger">Urgent (Red)</option>
              </select>
            </div>
          </div>

          {/* Live Preview */}
          {form.announcementBanner.active && form.announcementBanner.message && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Live Preview:</span>
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  form.announcementBanner.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : form.announcementBanner.type === 'danger'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : form.announcementBanner.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                <span>{form.announcementBanner.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Support & Helpline Information */}
        <div className="panel p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Mail className="h-5 w-5 text-chamber-700" />
            <h2 className="text-base font-bold text-ink">Support & Helpline Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Official Support Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => setForm((p) => ({ ...p, supportEmail: e.target.value }))}
                  className="input-base pl-9 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Toll-Free Helpline Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  value={form.supportPhone}
                  onChange={(e) => setForm((p) => ({ ...p, supportPhone: e.target.value }))}
                  className="input-base pl-9 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer save */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" loading={saving} className="gap-1.5 shadow-sm px-6">
            <Save className="h-4 w-4" /> Save Platform Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
