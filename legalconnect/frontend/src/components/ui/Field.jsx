import { forwardRef, useId } from 'react';

const inputCls = (error) =>
  `block w-full rounded-md border bg-white dark:bg-[#0E1715] px-3 py-2 text-sm text-ink dark:text-[#E2ECE8] placeholder:text-ink-muted/70 dark:placeholder-[#5D7570] transition-colors ${
    error ? 'border-danger-500' : 'border-line dark:border-[#233833] hover:border-chamber-300 dark:hover:border-chamber-500'
  }`;

export const Field = forwardRef(function Field({ label, error, hint, as: Tag = 'input', className = '', children, ...props }, ref) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink dark:text-[#E2ECE8]">{label}</label>
      <Tag id={id} ref={ref} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`${inputCls(error)} ${Tag === 'input' ? 'h-10' : ''}`} {...props}>
        {children}
      </Tag>
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger-700">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
});

export default Field;
