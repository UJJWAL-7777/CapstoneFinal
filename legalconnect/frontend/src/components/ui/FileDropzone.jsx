import { useCallback, useRef, useState } from 'react';
import { Upload, X, FileText, ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const FORMAT_LABELS = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

export default function FileDropzone({ onFile, accept, maxSizeMB = 10, label = 'Upload File' }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      setError(err?.message || 'File rejected');
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
      onFile(accepted[0]);
    }
  }, [onFile]);

  const acceptMap = accept || {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
  });

  const clearFile = () => { setFile(null); setError(''); onFile(null); };
  const isImage = file && file.type.startsWith('image/');

  return (
    <div className="space-y-2">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-chamber-500 bg-chamber-50' : 'border-line hover:border-chamber-400 hover:bg-paper'
          }`}
        >
          <input {...getInputProps()} id="file-dropzone" />
          <Upload className="mx-auto h-8 w-8 text-ink-muted" />
          <p className="mt-2 text-sm font-medium text-ink">{isDragActive ? 'Drop file here' : label}</p>
          <p className="mt-1 text-xs text-ink-muted">PDF, Word, images — max {maxSizeMB}MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-chamber-200 bg-chamber-50 p-4">
          {isImage
            ? <ImageIcon className="h-8 w-8 text-chamber-500" />
            : <FileText className="h-8 w-8 text-chamber-500" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted">{(file.size / 1024).toFixed(0)} KB · {FORMAT_LABELS[file.type] || 'File'}</p>
          </div>
          <button onClick={clearFile} className="rounded-lg p-1 text-ink-muted hover:bg-chamber-100 hover:text-danger-500 transition-colors" aria-label="Remove file">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
