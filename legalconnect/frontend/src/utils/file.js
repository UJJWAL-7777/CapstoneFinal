/**
 * Resolves a stored file path to a fully qualified URL
 */
export function getFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  // In development, backend runs on port 5000
  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000';

  return `${backendBase}${cleanPath}`;
}

/**
 * Programmatically triggers a download of a remote file with a custom filename
 */
export async function downloadFile(url, filename = 'document') {
  const fullUrl = getFileUrl(url);
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Formats byte size to human-readable string (KB, MB)
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
