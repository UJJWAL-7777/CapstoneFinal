import { useEffect, useState } from 'react';
import { caseService } from '../../services/caseService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import { Users, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Clients() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caseService.list({ limit: 50 }).then((d) => setCases(d.cases || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Unique clients from cases
  const clients = Object.values(
    cases.reduce((acc, c) => {
      const cid = c.client?._id;
      if (cid && !acc[cid]) acc[cid] = { ...c.client, cases: [] };
      if (cid) acc[cid].cases.push(c);
      return acc;
    }, {})
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">My Clients</h1>
        <p className="text-ink-soft mt-1">{clients.length} clients across your cases</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" /></div>
      ) : clients.length === 0 ? (
        <div className="panel p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No clients yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client._id} className="panel p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={client.name} src={client.avatar?.url} size="md" />
                <div>
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-xs text-ink-muted">{client.cases?.length} case(s)</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-ink-muted">
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{client.email}</p>
                {client.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{client.phone}</p>}
              </div>
              <div className="mt-3 space-y-1.5">
                {client.cases?.map((c) => (
                  <Link key={c._id} to={`/advocate/cases/${c._id}`} className="flex items-center justify-between text-xs text-chamber-600 hover:underline">
                    <span className="truncate">{c.title}</span>
                    <span className="text-ink-muted ml-2">{c.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
