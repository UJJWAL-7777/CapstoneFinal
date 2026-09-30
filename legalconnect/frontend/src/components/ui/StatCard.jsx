import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'chamber', className = '' }) {
  const colors = {
    chamber: 'bg-chamber-50 text-chamber-600 dark:bg-chamber-900/40 dark:text-chamber-300',
    brass: 'bg-brass-100 text-brass-600 dark:bg-brass-900/40 dark:text-brass-300',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    danger: 'bg-danger-50 text-danger-500 dark:bg-danger-950/40 dark:text-danger-400',
    info: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300',
  };

  return (
    <div className={`panel p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-[#8A9E99]">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-ink dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-ink-muted dark:text-[#8A9E99]">{subtitle}</p>}
          {trend && trendValue && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-danger-500'}`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${colors[color]}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
