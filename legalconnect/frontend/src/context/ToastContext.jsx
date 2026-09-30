import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const CONFIG = {
  success: {
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700/50',
    barColor: 'bg-emerald-500',
    title: 'Success',
  },
  error: {
    icon: AlertCircle,
    badgeBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-700/50',
    barColor: 'bg-rose-500',
    title: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700/50',
    barColor: 'bg-amber-500',
    title: 'Warning',
  },
  info: {
    icon: Info,
    badgeBg: 'bg-chamber-100 dark:bg-chamber-900/40 text-chamber-600 dark:text-chamber-400',
    border: 'border-chamber-300 dark:border-chamber-700/50',
    barColor: 'bg-chamber-500',
    title: 'Notice',
  },
};

function ToastItem({ toast, onDismiss }) {
  const { id, type = 'info', message, title, duration = 5000, action } = toast;
  const config = CONFIG[type] || CONFIG.info;
  const Icon = config.icon;

  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(duration);

  useEffect(() => {
    if (duration <= 0) return;

    let timerId;
    const updateProgress = () => {
      if (isPaused) return;

      const elapsed = Date.now() - startTimeRef.current;
      const left = remainingRef.current - elapsed;
      const pct = Math.max(0, (left / duration) * 100);
      setProgress(pct);

      if (left <= 0) {
        onDismiss(id);
      } else {
        timerId = requestAnimationFrame(updateProgress);
      }
    };

    timerId = requestAnimationFrame(updateProgress);

    return () => {
      if (timerId) cancelAnimationFrame(timerId);
    };
  }, [id, duration, isPaused, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    remainingRef.current = (progress / 100) * duration;
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  return (
    <div
      role="status"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative flex w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-white shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up hover:shadow-2xl dark:bg-[#13201D] dark:text-[#E2ECE8] ${config.border}`}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.badgeBg}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-[#8A9E99]">
              {title}
            </p>
          )}
          <p className="text-sm font-medium text-ink dark:text-[#E2ECE8] leading-snug break-words">
            {message}
          </p>
          {action && (
            <button
              onClick={() => {
                action.onClick?.();
                onDismiss(id);
              }}
              className="mt-2 text-xs font-semibold text-chamber-600 hover:text-chamber-700 dark:text-chamber-400 dark:hover:text-chamber-300 underline"
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(id)}
          className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-paper hover:text-ink dark:text-[#8A9E99] dark:hover:bg-[#1C2C28] dark:hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {duration > 0 && (
        <div className="h-1 w-full bg-paper dark:bg-[#0E1715]">
          <div
            className={`h-full transition-[width] ease-linear duration-75 ${config.barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((type, messageOrOptions) => {
    const id = crypto.randomUUID();
    let toastData = { id, type };

    if (typeof messageOrOptions === 'string') {
      toastData.message = messageOrOptions;
    } else if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      toastData = { ...toastData, ...messageOrOptions };
    }

    setToasts((prev) => [...prev.slice(-4), toastData]);
    return id;
  }, []);

  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    warning: (m) => push('warning', m),
    info: (m) => push('info', m),
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[9999] flex flex-col items-center gap-2.5 px-4 sm:items-end sm:pr-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
