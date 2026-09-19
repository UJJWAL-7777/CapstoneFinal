export default function AuthShell({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="mx-auto px-4 py-10 sm:py-14" style={{ maxWidth: wide ? '42rem' : '28rem' }}>
      <h1 className="text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
      <div className="panel mt-6 p-5 sm:p-6">{children}</div>
      {footer && <p className="mt-5 text-center text-sm text-ink-soft">{footer}</p>}
    </div>
  );
}
