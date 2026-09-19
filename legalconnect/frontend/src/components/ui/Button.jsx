import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-chamber-700 text-white hover:bg-chamber-800 disabled:bg-chamber-700/60',
  brass: 'bg-brass-500 text-white hover:bg-brass-600 disabled:bg-brass-500/60',
  secondary: 'border border-line bg-white text-ink hover:bg-chamber-50 disabled:text-ink-muted',
  ghost: 'text-ink-soft hover:bg-chamber-50 hover:text-ink',
  danger: 'bg-danger-500 text-white hover:bg-danger-700 disabled:bg-danger-500/60',
  outline: 'border border-chamber-600 text-chamber-700 hover:bg-chamber-50 disabled:text-ink-muted',
};
const SIZES = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };

export default function Button({ as, to, variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...rest }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size]} ${className}`;
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  const Tag = as || 'button';
  return (
    <Tag className={cls} disabled={disabled || loading} {...(Tag === 'button' ? { type: rest.type || 'button' } : {})} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </Tag>
  );
}
