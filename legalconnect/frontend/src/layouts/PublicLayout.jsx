import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_HOME } from '../utils/constants.js';
import { PlatformBanners } from '../context/PlatformContext.jsx';

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <PlatformBanners />
      <header className="border-b border-line bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1">
            <Link to="/about" className="hidden sm:block px-3 py-2 text-sm text-ink-soft hover:text-ink transition-colors">About</Link>
            <Link to="/how-it-works" className="hidden sm:block px-3 py-2 text-sm text-ink-soft hover:text-ink transition-colors">How It Works</Link>
            <Link to="/legal-resources" className="hidden sm:block px-3 py-2 text-sm text-ink-soft hover:text-ink transition-colors">Resources</Link>
            <div className="ml-2 flex items-center gap-2">
              {isAuthenticated ? (
                <Button to={ROLE_HOME[user.role]}>Go to dashboard</Button>
              ) : (
                <>
                  <Button to="/login" variant="ghost">Sign in</Button>
                  <Button to="/register">Get started</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>&copy; {new Date().getFullYear()} LegalConnect</p>
          <p className="max-w-xl">LegalConnect provides general legal information and does not replace professional legal advice.</p>
        </div>
      </footer>
    </div>
  );
}
