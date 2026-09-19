import { useEffect, useState } from 'react';
import { FileText, Download, Search } from 'lucide-react';
import { caseService } from '../../services/caseService.js';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Documents() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allDocs, setAllDocs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    caseService.list({ limit: 50 }).then(async (data) => {
      const cList = data.cases || [];
      setCases(cList);
      const docArrays = await Promise.all(cList.map((c) => caseService.getDocuments(c._id).catch(() => [])));
      const enriched = docArrays.flatMap((docs, i) =>
        docs.map((d) => ({ ...d, caseTitle: cList[i].title, caseId: cList[i]._id }))
      );
      setAllDocs(enriched);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = allDocs.filter((d) =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.caseTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">My Documents</h1>
        <p className="text-ink-soft mt-1">All documents across your cases</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="input-base pl-10" />
      </div>

      {loading ? <SkeletonTable /> : filtered.length === 0 ? (
        <div className="panel p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No documents found</p>
        </div>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Case</th><th>Category</th><th>Size</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc._id}>
                  <td className="flex items-center gap-2"><FileText className="h-4 w-4 text-chamber-500" /><span className="font-medium">{doc.name}</span></td>
                  <td><Link to={`/client/cases/${doc.caseId}?tab=documents`} className="text-chamber-600 hover:underline text-sm">{doc.caseTitle}</Link></td>
                  <td><Badge variant="default">{doc.category}</Badge></td>
                  <td className="text-ink-muted">{(doc.size / 1024).toFixed(0)} KB</td>
                  <td className="text-ink-muted">{format(new Date(doc.createdAt), 'MMM d, yyyy')}</td>
                  <td><a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-chamber-600 hover:text-chamber-800"><Download className="h-4 w-4" /></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
