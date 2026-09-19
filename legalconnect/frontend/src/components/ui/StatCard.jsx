import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'chamber', className = '' }) {
  const colors = {
    chamber: 'bg-chamber-50 text-chamber-600',
    brass: 'bg-brass-100 text-brass-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-danger-50 text-danger-500',
    info: 'bg-sky-50 text-sky-600',
  };

  return (
    <div className={`panel p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-ink">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
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
