import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, Menu, X, Users, Scale, Calendar,
  MessageSquare, FileText, Bell, Settings, CreditCard, Award,
  ShieldCheck, ClipboardList, Search, Briefcase, Star,
  BarChart2, ScrollText, UserCheck, AlertCircle,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import { ROLE_HOME } from '../utils/constants.js';
import { useNotifications } from '../hooks/useNotifications.js';
import Avatar from '../components/ui/Avatar.jsx';

const NAV = {
  client: [
    { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/client/advocates', label: 'Find Advocates', icon: Search },
    { to: '/client/consultations', label: 'Consultations', icon: Calendar },
    { to: '/client/cases', label: 'My Cases', icon: Scale },
    { to: '/client/documents', label: 'Documents', icon: FileText },
    { to: '/client/messages', label: 'Messages', icon: MessageSquare },
    { to: '/client/notifications', label: 'Notifications', icon: Bell },
    { to: '/client/profile', label: 'Profile', icon: Users },
    { to: '/client/settings', label: 'Settings', icon: Settings },
  ],
  advocate: [
    { to: '/advocate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/advocate/consultations', label: 'Consultations', icon: Calendar },
    { to: '/advocate/clients', label: 'Clients', icon: Users },
    { to: '/advocate/cases', label: 'Cases', icon: Scale },
    { to: '/advocate/messages', label: 'Messages', icon: MessageSquare },
    { to: '/advocate/calendar', label: 'Availability', icon: ClipboardList },
    { to: '/advocate/earnings', label: 'Earnings', icon: CreditCard },
    { to: '/advocate/reviews', label: 'Reviews', icon: Star },
    { to: '/advocate/badges', label: 'Badges', icon: Award },
    { to: '/advocate/profile', label: 'Profile', icon: UserCheck },
    { to: '/advocate/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/advocates', label: 'Advocates', icon: Briefcase },
    { to: '/admin/verification', label: 'Verification', icon: ShieldCheck },
    { to: '/admin/consultations', label: 'Consultations', icon: Calendar },
    { to: '/admin/cases', label: 'Cases', icon: Scale },
    { to: '/admin/reports', label: 'Reports', icon: AlertCircle },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/badges', label: 'Badges', icon: Award },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await logout();
    toast.info('You have been signed out.');
    navigate('/login', { replace: true });
  };

  const navItems = NAV[user.role] || [];

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5 border-b border-white/10">
        <Logo to={ROLE_HOME[user.role]} light />
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="rounded-full bg-brass-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={user.name} src={user.avatar?.url} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs capitalize text-chamber-200">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link w-full"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex bg-paper">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-chamber-900 lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {/* Mobile header */}
      <div className="flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Logo to={ROLE_HOME[user.role]} />
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="rounded-full bg-brass-500 px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span>
          )}
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-ink hover:bg-paper transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 bg-chamber-900 flex flex-col animate-slide-up">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-chamber-100 hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
