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
            <Link to="/emergency" className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white border border-rose-500/20 transition-all shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              SOS Helplines
            </Link>
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
      <footer className="border-t border-line dark:border-[#1E302B] bg-white dark:bg-[#080E0C] transition-colors">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-line/60 dark:border-[#1A2824]">
            <Logo />
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-ink-soft dark:text-[#CBDAD5]">
              <Link to="/about" className="hover:text-ink dark:hover:text-white transition-colors">About Us</Link>
              <Link to="/how-it-works" className="hover:text-ink dark:hover:text-white transition-colors">How It Works</Link>
              <Link to="/legal-resources" className="hover:text-ink dark:hover:text-white transition-colors">Bharat Legal Hub</Link>
              <Link to="/legal-notice" className="hover:text-ink dark:hover:text-white transition-colors">Legal Notice Generator</Link>
              <Link to="/emergency" className="text-rose-600 dark:text-rose-400 hover:underline transition-colors font-bold">
                🚨 Emergency SOS (1091 / 1930 / 14567 / 1098)
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-ink-muted dark:text-[#7A968F]">
            <p>&copy; {new Date().getFullYear()} LegalConnect Technologies. All rights reserved.</p>
            <p className="max-w-xl text-center sm:text-right">
              LegalConnect provides legal enablement & directory services compliant with Bar Council of India guidelines. Does not constitute an advertisement or direct solicitation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
