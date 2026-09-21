import { useState } from 'react';
import { X, Download, ExternalLink, FileText, Image as ImageIcon, Eye } from 'lucide-react';
import Button from './Button.jsx';
import Badge from './Badge.jsx';
import { getFileUrl, downloadFile, formatFileSize } from '../../utils/file.js';
import { format } from 'date-fns';

export default function DocumentPreviewModal({ document: doc, isOpen, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !doc) return null;

  const fileUrl = getFileUrl(doc.url);
  const isImage =
    doc.mimeType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.name || doc.url);
  const isPdf =
    doc.mimeType === 'application/pdf' ||
    /\.pdf$/i.test(doc.name || doc.url);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadFile(doc.url, doc.originalName || doc.name);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-slide-up border border-line">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-paper/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-chamber-50 border border-chamber-200 text-chamber-700 shrink-0">
              {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-ink truncate">{doc.name}</h3>
                {doc.category && <Badge variant="primary" size="xs">{doc.category}</Badge>}
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {formatFileSize(doc.size)}
                {doc.createdAt && ` • Uploaded on ${format(new Date(doc.createdAt), 'MMM d, yyyy')}`}
                {doc.caseTitle && ` • Case: ${doc.caseTitle}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-paper transition-colors shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Preview Area */}
        <div className="flex-1 overflow-auto p-4 bg-paper/20 min-h-[360px] flex items-center justify-center">
          {isImage ? (
            <div className="flex items-center justify-center w-full h-full max-h-[68vh] overflow-auto rounded-xl bg-white p-2 border border-line">
              <img
                src={fileUrl}
                alt={doc.name}
                className="max-h-[65vh] max-w-full object-contain rounded-lg"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[68vh] rounded-xl overflow-hidden border border-line bg-white shadow-inner">
              <iframe
                src={`${fileUrl}#view=FitH`}
                className="w-full h-full border-0"
                title={doc.name}
              />
            </div>
          ) : (
            <div className="p-10 text-center space-y-3 bg-white rounded-xl border border-dashed border-line max-w-md">
              <FileText className="mx-auto h-16 w-16 text-chamber-600 opacity-80" />
              <h4 className="font-semibold text-ink text-base">{doc.name}</h4>
              <p className="text-xs text-ink-muted">
                This file format ({doc.mimeType || 'Document'}) cannot be rendered inline in the browser. Click below to download the file directly.
              </p>
              <Button onClick={handleDownload} loading={downloading} size="sm" className="gap-1.5">
                <Download className="h-4 w-4" /> Download to View
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-line bg-white">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-chamber-700 hover:underline flex items-center gap-1 font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open in new browser tab
          </a>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              loading={downloading}
              className="gap-1.5 shadow-sm"
            >
              <Download className="h-4 w-4" /> Download File
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
