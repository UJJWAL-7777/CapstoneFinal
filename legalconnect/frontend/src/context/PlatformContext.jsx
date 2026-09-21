import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { TOKEN_KEY } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Wrench,
  ExternalLink,
  Phone,
  Mail,
} from 'lucide-react';

const PlatformContext = createContext(null);

export function PlatformProvider({ children }) {
  const { user } = useAuth();
  const [status, setStatus] = useState({
    maintenanceMode: false,
    announcementBanner: { active: false, message: '', type: 'info' },
    supportEmail: 'support@legalconnect.local',
    supportPhone: '+91 1800 123 4567',
    loading: true,
  });
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/platform/status');
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data.data) {
          setStatus((prev) => ({
            ...prev,
            maintenanceMode: Boolean(data.data.maintenanceMode),
            announcementBanner: data.data.announcementBanner || { active: false, message: '', type: 'info' },
            supportEmail: data.data.supportEmail || 'support@legalconnect.local',
            supportPhone: data.data.supportPhone || '+91 1800 123 4567',
            loading: false,
          }));
        }
      }
    } catch {
      // Fallback gracefully
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Socket.IO real-time listener for instant settings broadcast
    const token = localStorage.getItem(TOKEN_KEY);
    const socketUrl = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;
    const socket = io(socketUrl, {
      auth: { token: token || undefined },
      transports: ['websocket', 'polling'],
    });

    socket.on('platform:status:updated', (newStatus) => {
      setStatus((prev) => ({
        ...prev,
        maintenanceMode: Boolean(newStatus.maintenanceMode),
        announcementBanner: newStatus.announcementBanner || prev.announcementBanner,
        supportEmail: newStatus.supportEmail || prev.supportEmail,
        supportPhone: newStatus.supportPhone || prev.supportPhone,
      }));
      setDismissedAnnouncement(false);
    });

    // Fallback polling every 15 seconds
    const interval = setInterval(fetchStatus, 15000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [fetchStatus]);

  return (
    <PlatformContext.Provider
      value={{
        ...status,
        dismissedAnnouncement,
        setDismissedAnnouncement,
        refreshStatus: fetchStatus,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatformStatus() {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatformStatus must be used within a PlatformProvider');
  }
  return ctx;
}

export function PlatformBanners() {
  const {
    maintenanceMode,
    announcementBanner,
    supportEmail,
    supportPhone,
    isAdmin,
    dismissedAnnouncement,
    setDismissedAnnouncement,
  } = usePlatformStatus();

  return (
    <div className="w-full flex flex-col z-40 relative">
      {/* Maintenance Mode Banner */}
      {maintenanceMode && (
        <div
          role="alert"
          className={`w-full py-2.5 px-4 text-xs sm:text-sm font-medium border-b shadow-sm transition-all animate-fade-in ${
            isAdmin
              ? 'bg-amber-950 text-amber-200 border-amber-800'
              : 'bg-gradient-to-r from-rose-700 via-amber-700 to-rose-700 text-white border-rose-800'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              {isAdmin ? (
                <Wrench className="h-4 w-4 shrink-0 text-amber-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-200 animate-pulse" />
              )}
              <span>
                {isAdmin ? (
                  <>
                    <strong className="font-bold uppercase tracking-wider text-amber-300">
                      Maintenance Mode Active:
                    </strong>{' '}
                    Platform is currently in maintenance mode. Clients & advocates will see system maintenance notices.
                  </>
                ) : (
                  <>
                    <strong className="font-bold uppercase tracking-wider">
                      Platform Maintenance Notice:
                    </strong>{' '}
                    LegalConnect is currently undergoing scheduled maintenance. Booking and new actions may be paused.
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs">
              {isAdmin ? (
                <Link
                  to="/admin/settings"
                  className="underline hover:text-white font-semibold flex items-center gap-1 bg-amber-900/60 px-2.5 py-1 rounded"
                >
                  Manage in Settings <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <div className="flex items-center gap-3 opacity-90">
                  {supportEmail && (
                    <a
                      href={`mailto:${supportEmail}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" /> {supportEmail}
                    </a>
                  )}
                  {supportPhone && (
                    <span className="hidden md:flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {supportPhone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* General Announcement Banner (if enabled and not dismissed) */}
      {announcementBanner?.active && announcementBanner?.message && !dismissedAnnouncement && (
        <div
          role="region"
          aria-label="Platform Announcement"
          className={`w-full py-2 px-4 text-xs font-semibold border-b transition-all animate-fade-in ${
            announcementBanner.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : announcementBanner.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-chamber-50 text-chamber-900 border-chamber-200'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
              {announcementBanner.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              ) : announcementBanner.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Info className="h-4 w-4 shrink-0 text-chamber-600" />
              )}
              <span className="text-center sm:text-left">{announcementBanner.message}</span>
            </div>
            <button
              onClick={() => setDismissedAnnouncement(true)}
              className="p-1 rounded hover:bg-black/5 text-ink-muted transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
