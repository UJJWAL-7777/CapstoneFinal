import { Wrench, AlertTriangle, ShieldCheck, Mail, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button.jsx';
import { usePlatformStatus } from '../../context/PlatformContext.jsx';

export default function MaintenanceNotice({
  serviceName = 'This Service',
  description,
  backTo = '/dashboard',
  backLabel = 'Back to Dashboard',
}) {
  const { supportEmail, supportPhone, refreshStatus } = usePlatformStatus();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-xl w-full panel p-8 text-center space-y-6 shadow-xl border-amber-200 bg-gradient-to-b from-white to-amber-50/30">
        {/* Animated Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-inner">
          <Wrench className="h-8 w-8 animate-pulse" />
        </div>

        {/* Title and Badge */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
            Scheduled Maintenance Period
          </span>
          <h1 className="text-2xl font-bold text-ink">
            {serviceName} is Temporarily Unavailable
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed max-w-md mx-auto">
            {description ||
              `LegalConnect is currently undergoing scheduled platform upgrades and security maintenance. ${serviceName} is temporarily paused to protect your transactions and records.`}
          </p>
        </div>

        {/* Informational Status Card */}
        <div className="p-4 rounded-xl bg-white border border-line text-left space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <span className="text-ink-muted">System State:</span>
            <span className="font-semibold text-amber-800 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Maintenance Mode Active
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <span className="text-ink-muted">Data Security:</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> All user accounts and case files are secure
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-ink-muted">
            <span>Emergency or Urgent Legal Queries:</span>
            <div className="flex items-center gap-3 font-medium text-chamber-700">
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className="hover:underline flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {supportEmail}
                </a>
              )}
              {supportPhone && (
                <a href={`tel:${supportPhone}`} className="hover:underline flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {supportPhone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={backTo} className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" /> {backLabel}
            </Button>
          </Link>
          <Button onClick={refreshStatus} className="w-full sm:w-auto gap-2">
            <RefreshCw className="h-4 w-4" /> Check System Status
          </Button>
        </div>
      </div>
    </div>
  );
}
