import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_HOME } from '../utils/constants.js';
import { PlatformBanners } from '../context/PlatformContext.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink transition-colors duration-200">
      <PlatformBanners />
      <header className="border-b border-line dark:border-[#233833] bg-white/95 dark:bg-[#0B1311]/95 backdrop-blur sticky top-0 z-30 transition-colors">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1">
            <Link to="/about" className="hidden sm:block px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink dark:text-[#CBDAD5] dark:hover:text-white transition-colors">About</Link>
            <Link to="/how-it-works" className="hidden sm:block px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink dark:text-[#CBDAD5] dark:hover:text-white transition-colors">How It Works</Link>
            <Link to="/legal-resources" className="hidden sm:block px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink dark:text-[#CBDAD5] dark:hover:text-white transition-colors">Resources</Link>
            <Link to="/legal-notice" className="hidden sm:block px-3 py-2 text-sm font-semibold text-chamber-700 hover:text-chamber-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">Notice Generator</Link>
            <ThemeToggle className="ml-1" />
            <div className="ml-2 flex items-center gap-2">
              {isAuthenticated ? (
                <Button to={ROLE_HOME[user.role]}>Go to dashboard</Button>
              ) : (
                <>
                  <Button to="/login" variant="ghost" className="text-ink dark:text-[#E2ECE8] hover:bg-paper dark:hover:bg-[#182824]">Sign in</Button>
                  <Button to="/register">Get started</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-line bg-white transition-colors">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>&copy; {new Date().getFullYear()} LegalConnect</p>
          <p className="max-w-xl">LegalConnect provides general legal information and does not replace professional legal advice.</p>
        </div>
      </footer>
    </div>
  );
}
