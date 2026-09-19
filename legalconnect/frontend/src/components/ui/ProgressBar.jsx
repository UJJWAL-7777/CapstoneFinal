export default function ProgressBar({ value, max, label, color = 'chamber', showValue = true, size = 'md' }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const colors = {
    chamber: 'bg-chamber-500',
    brass: 'bg-brass-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-danger-500',
  };
  const sizes = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-soft">{label}</span>
          {showValue && <span className="text-xs font-medium text-ink-muted">{value} / {max}</span>}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-line ${sizes[size]}`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
