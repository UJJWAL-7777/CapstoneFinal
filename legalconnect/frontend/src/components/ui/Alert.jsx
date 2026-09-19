import { AlertCircle, Info } from 'lucide-react';

const TONES = {
  error: { cls: 'border-danger-500/30 bg-danger-50 text-danger-700', Icon: AlertCircle },
  info: { cls: 'border-chamber-200 bg-chamber-50 text-chamber-800', Icon: Info },
  warning: { cls: 'border-brass-400/50 bg-brass-100 text-brass-700', Icon: AlertCircle },
};

export default function Alert({ tone = 'info', title, children, className = '' }) {
  const { cls, Icon } = TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-md border p-3 text-sm ${cls} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
    </div>
  );
}
