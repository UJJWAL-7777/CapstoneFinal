import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center rounded-lg border border-line bg-paper p-0.5 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
            theme === 'light'
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
          title="Light Mode"
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
            theme === 'dark'
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
          title="Dark Mode"
        >
          <Moon className="h-3.5 w-3.5 text-chamber-400" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
            theme === 'system'
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
          title="System Preference"
        >
          <Monitor className="h-3.5 w-3.5" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  // Interactive single button:
  // When currently Dark, show SUN icon (click to switch to light)
  // When currently Light, show MOON icon (click to switch to dark)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink shadow-sm transition-all duration-200 hover:scale-105 hover:border-chamber-400 active:scale-95 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200" />
      ) : (
        <Moon className="h-4 w-4 text-chamber-600 transition-transform duration-200" />
      )}
    </button>
  );
}
