import { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Copy,
  Check,
  X,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRIMARY_SOS_HOTLINES } from '../data/emergencyHotlinesData.js';
import { useToast } from '../context/ToastContext.jsx';

export default function EmergencySOSModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (number, title, id) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    toast({
      type: 'success',
      title: 'Number Copied',
      message: `${number} (${title}) copied to clipboard.`,
      duration: 3000,
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-rose-500/30 bg-white dark:bg-[#0D1513] shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
      >
        {/* Top Emergency Red Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-line dark:border-[#223530]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="emergency-modal-title"
                  className="text-lg font-bold text-ink dark:text-white"
                >
                  Emergency SOS Hotlines (India)
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  24x7 Live
                </span>
              </div>
              <p className="text-xs text-ink-muted dark:text-[#9FB7B0]">
                Toll-free government crisis helplines. Tap to call or copy immediately.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-paper dark:hover:bg-[#1A2A25] hover:text-ink dark:hover:text-white transition-colors"
            aria-label="Close emergency modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Dial Cards Grid */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRIMARY_SOS_HOTLINES.map((hotline) => {
              const isCopied = copiedId === hotline.id;
              return (
                <div
                  key={hotline.id}
                  className="flex flex-col justify-between rounded-xl border border-line dark:border-[#20342F] bg-paper dark:bg-[#111C19] p-4 hover:border-rose-400/40 dark:hover:border-rose-500/30 transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        {hotline.badge}
                      </span>
                      <span className="text-[10px] text-ink-muted dark:text-[#7A968F] truncate max-w-[140px]">
                        Alt: {hotline.altNumber}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-ink dark:text-white line-clamp-1">
                      {hotline.title}
                    </h3>
                    <p className="text-xs text-ink-muted dark:text-[#9FB7B0] line-clamp-1 mb-3">
                      {hotline.tagline}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-line/60 dark:border-[#1E302B]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                        {hotline.number}
                      </span>
                      <button
                        onClick={() => handleCopy(hotline.number, hotline.title, hotline.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-soft dark:text-[#B6C8C3] hover:bg-white dark:hover:bg-[#1A2A25] border border-line dark:border-[#2A3E38] transition-colors"
                        title="Copy Number"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <a
                      href={`tel:${hotline.number}`}
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-rose-600 hover:bg-rose-700 text-white py-2 text-xs font-bold shadow-sm transition-all hover:shadow-rose-600/30"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      {hotline.dialPrompt}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice Banner */}
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed">
              <strong>Need Immediate Police / Medical Assistance?</strong> Dial{' '}
              <a href="tel:112" className="underline font-bold text-amber-700 dark:text-amber-300">
                112 (National Emergency)
              </a>{' '}
              for instant GPS-tracked dispatch.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-paper dark:bg-[#0B1311] border-t border-line dark:border-[#223530]">
          <Link
            to="/emergency"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-chamber-700 hover:text-chamber-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            <span>Open Full Directory & Legal Protocols</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg border border-line dark:border-[#2A3E38] px-3.5 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink dark:text-[#9FB7B0] dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
