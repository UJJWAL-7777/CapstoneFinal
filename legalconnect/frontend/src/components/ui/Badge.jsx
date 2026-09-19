export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-paper text-ink-soft border border-line',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-danger-50 text-danger-500 border border-danger-500/20',
    primary: 'bg-chamber-50 text-chamber-700 border border-chamber-200',
    brass: 'bg-brass-100 text-brass-600 border border-brass-400/30',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
  };
  const sizes = {
    xs: 'px-1.5 py-0 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  return (
    <span className={`badge-pill font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
