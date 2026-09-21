import { useEffect, useState } from 'react';
import {
  FileText, Download, Search, Upload, Plus, Eye,
  CheckCircle2, AlertCircle, Image as ImageIcon, ExternalLink, X
} from 'lucide-react';
import { caseService } from '../../services/caseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import FileDropzone from '../../components/ui/FileDropzone.jsx';
import DocumentPreviewModal from '../../components/ui/DocumentPreviewModal.jsx';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getFileUrl, downloadFile, formatFileSize } from '../../utils/file.js';

const CATEGORIES = [
  { value: 'Agreement', label: 'Agreement / Contract' },
  { value: 'Identity', label: 'Identity Proof' },
  { value: 'Court', label: 'Court Order' },
  { value: 'Evidence', label: 'Evidence' },
  { value: 'Legal', label: 'Legal Notice / Property Deed' },
  { value: 'Financial', label: 'Financial Statement' },
  { value: 'Correspondence', label: 'Correspondence' },
  { value: 'Other', label: 'Other' },
];

export default function Documents() {
  const toast = useToast();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allDocs, setAllDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Upload modal states
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Other');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      // 1. Fetch user's cases for dropdown selection
      const casesRes = await caseService.list({ limit: 50 }).catch(() => ({ cases: [] }));
      const cList = casesRes.cases || [];
      setCases(cList);
      if (cList.length > 0 && !selectedCaseId) {
        setSelectedCaseId(cList[0]._id);
      }

      // 2. Fetch all documents via dedicated endpoint (or fallback)
      let docs = [];
      try {
        docs = await caseService.getAllDocuments();
      } catch {
        // Fallback: fetch per case
        const docArrays = await Promise.all(cList.map((c) => caseService.getDocuments(c._id).catch(() => [])));
        docs = docArrays.flatMap((dList, i) =>
          dList.map((d) => ({
            ...d,
            caseTitle: cList[i].title,
            caseId: cList[i]._id,
          }))
        );
      }

      // Enrich with caseTitle if populated as an object
      const enriched = (docs || []).map((d) => ({
        ...d,
        caseTitle: d.case?.title || d.caseTitle || 'General Case',
        caseId: d.case?._id || d.caseId,
      }));

      setAllDocs(enriched);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadName('');
    setUploadCategory('Other');
    setUploadDescription('');
  };

  const handleUpload = async (keepOpenAfterUpload = false) => {
    if (!uploadFile) {
      toast.error('Please choose a file to upload');
      return;
    }
    if (!selectedCaseId) {
      toast.error('Please select a case for this document');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('name', uploadName.trim() || uploadFile.name);
      fd.append('category', uploadCategory);
      if (uploadDescription) fd.append('description', uploadDescription);

      const newDoc = await caseService.uploadDocument(selectedCaseId, fd);
      const matchedCase = cases.find((c) => c._id === selectedCaseId);
      const enrichedDoc = {
        ...newDoc,
        caseTitle: matchedCase?.title || 'Case Document',
        caseId: selectedCaseId,
      };

      setAllDocs((prev) => [enrichedDoc, ...prev]);
      toast.success(`"${enrichedDoc.name}" uploaded successfully!`);

      resetUploadForm();
      if (!keepOpenAfterUpload) {
        setShowUpload(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const filtered = allDocs.filter((d) => {
    const matchesCategory = !categoryFilter || d.category === categoryFilter;
    const matchesSearch =
      !search ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.caseTitle?.toLowerCase().includes(search.toLowerCase()) ||
      d.category?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Documents</h1>
          <p className="text-ink-soft text-sm mt-0.5">
            Manage, preview, and download your case filings and legal evidence
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            resetUploadForm();
            setShowUpload(true);
          }}
          className="gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Upload className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      {/* Search & Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by name, category, or case..."
              className="input-base pl-10 text-sm"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setCategoryFilter('')}
            className={`rounded-full px-3 py-1 text-xs font-medium shrink-0 transition-colors ${
              categoryFilter === ''
                ? 'bg-chamber-600 text-white shadow-sm'
                : 'bg-white border border-line text-ink hover:border-chamber-300'
            }`}
          >
            All Documents ({allDocs.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = allDocs.filter((d) => d.category === cat.value || d.category === cat.label).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium shrink-0 transition-colors ${
                  categoryFilter === cat.value
                    ? 'bg-chamber-600 text-white shadow-sm'
                    : 'bg-white border border-line text-ink hover:border-chamber-300'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Document List / Table */}
      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center space-y-3">
          <FileText className="mx-auto h-12 w-12 text-ink-muted opacity-60" />
          <p className="text-lg font-semibold text-ink">
            {search || categoryFilter ? 'No matching documents found' : 'No documents uploaded yet'}
          </p>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            {search || categoryFilter
              ? 'Try changing your search terms or clearing your category filters.'
              : 'Upload agreements, property deeds, identity proofs, or evidence to share securely with your advocate.'}
          </p>
          <Button
            size="md"
            className="gap-1.5 mt-2"
            onClick={() => {
              resetUploadForm();
              setShowUpload(true);
            }}
          >
            <Upload className="h-4 w-4" /> Upload Document Now
          </Button>
        </div>
      ) : (
        <div className="panel overflow-x-auto shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Case Matter</th>
                <th>Category</th>
                <th>File Size</th>
                <th>Uploaded</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const isImage =
                  doc.mimeType?.startsWith('image/') ||
                  /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.name || doc.url);
                return (
                  <tr
                    key={doc._id}
                    className="hover:bg-paper/40 transition-colors cursor-pointer"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-chamber-50 text-chamber-700 shrink-0">
                          {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-ink text-sm truncate block hover:text-chamber-700">
                            {doc.name}
                          </span>
                          {doc.description && (
                            <span className="text-[11px] text-ink-muted truncate block">
                              {doc.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      {doc.caseId ? (
                        <Link
                          to={`/client/cases/${doc.caseId}?tab=documents`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-chamber-700 hover:underline text-xs font-medium"
                        >
                          {doc.caseTitle}
                        </Link>
                      ) : (
                        <span className="text-xs text-ink-muted">{doc.caseTitle}</span>
                      )}
                    </td>

                    <td>
                      <Badge variant="primary" size="xs">{doc.category || 'Other'}</Badge>
                    </td>

                    <td className="text-xs text-ink-muted">
                      {formatFileSize(doc.size)}
                    </td>

                    <td className="text-xs text-ink-muted">
                      {doc.createdAt ? format(new Date(doc.createdAt), 'MMM d, yyyy') : '—'}
                    </td>

                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="rounded-lg p-1.5 text-chamber-700 hover:bg-chamber-50 transition-colors"
                          title="Preview document inline"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => downloadFile(doc.url, doc.originalName || doc.name)}
                          className="rounded-lg p-1.5 text-ink-muted hover:text-ink hover:bg-paper transition-colors"
                          title="Download file directly"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload Legal Document"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpload(true)}
              loading={uploading}
              disabled={!uploadFile || !selectedCaseId}
              className="w-full sm:w-auto"
            >
              Upload & Add Another
            </Button>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpload(false)}
                loading={uploading}
                disabled={!uploadFile || !selectedCaseId}
                className="w-full sm:w-auto"
              >
                Upload & Finish
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          {cases.length > 0 ? (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Target Case / Matter <span className="text-danger-500">*</span>
              </label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="input-base text-xs"
              >
                {cases.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} (#{c.caseId || c._id.slice(-6)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <p className="font-semibold">No active cases found</p>
              <p className="text-amber-700 mt-0.5">
                Documents are organized within case workspaces. Please complete a consultation first to have a case opened by your advocate.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Select Document File <span className="text-danger-500">*</span>
            </label>
            <FileDropzone
              onFile={(f) => {
                setUploadFile(f);
                if (f && !uploadName) {
                  setUploadName(f.name.replace(/\.[^/.]+$/, ''));
                }
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Document Name / Title
              </label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g. Sale Agreement / Passport"
                className="input-base text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="input-base text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Brief details or remarks regarding this document..."
              className="input-base text-xs resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* In-Website Document Viewer Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
