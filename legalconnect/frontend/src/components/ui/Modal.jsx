import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button.jsx';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', hideClose = false }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-[#13201d] rounded-xl shadow-2xl animate-slide-up overflow-hidden border border-transparent dark:border-[#233833]`}>
        {(title || !hideClose) && (
          <div className="flex items-center justify-between border-b border-line dark:border-[#233833] px-6 py-4">
            {title && <h2 id="modal-title" className="text-lg font-semibold text-ink dark:text-white">{title}</h2>}
            {!hideClose && (
              <button onClick={onClose} className="ml-auto rounded-lg p-1.5 text-ink-muted hover:bg-paper dark:hover:bg-[#1c2c28] hover:text-ink dark:hover:text-white transition-colors" aria-label="Close modal">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5 text-ink dark:text-[#E2ECE8]">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-line dark:border-[#233833] px-6 py-4 bg-paper/50 dark:bg-[#0c1412]/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
