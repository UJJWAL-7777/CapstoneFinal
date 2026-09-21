import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { caseService } from '../../services/caseService.js';
import { consultationService } from '../../services/consultationService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { Users, Mail, Phone, Calendar, Scale, Search, Plus, MessageSquare, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      caseService.list({ limit: 50 }).catch(() => ({ cases: [] })),
      consultationService.list({ limit: 50 }).catch(() => ({ consultations: [] })),
    ]).then(([casesRes, consRes]) => {
      const casesList = casesRes.cases || [];
      const consList = consRes.consultations || [];

      const clientMap = {};

      // Add clients from cases
      casesList.forEach((c) => {
        const cid = c.client?._id;
        if (cid) {
          if (!clientMap[cid]) {
            clientMap[cid] = {
              ...c.client,
              cases: [],
              consultations: [],
            };
          }
          clientMap[cid].cases.push(c);
        }
      });

      // Add clients from consultations
      consList.forEach((cn) => {
        const cid = cn.client?._id;
        if (cid) {
          if (!clientMap[cid]) {
            clientMap[cid] = {
              ...cn.client,
              cases: [],
              consultations: [],
            };
          }
          clientMap[cid].consultations.push(cn);
        }
      });

      setClients(Object.values(clientMap));
    }).finally(() => setLoading(false));
  }, []);

  const handleOpenCase = (client) => {
    navigate('/advocate/cases', {
      state: {
        prefillClientId: client._id,
        prefillTitle: `Legal Matter — ${client.name}`,
      },
    });
  };

  const filtered = clients.filter((cl) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      cl.name?.toLowerCase().includes(s) ||
      cl.email?.toLowerCase().includes(s) ||
      cl.phone?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Clients</h1>
          <p className="text-ink-soft text-sm mt-0.5">
            {clients.length} connected client{clients.length !== 1 ? 's' : ''} across active legal cases and consultations
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients by name, email, or phone number..."
          className="input-base pl-10 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center space-y-3">
          <Users className="mx-auto h-12 w-12 text-ink-muted opacity-60" />
          <p className="text-lg font-semibold text-ink">
            {search ? 'No matching clients found' : 'No clients connected yet'}
          </p>
          <p className="text-sm text-ink-muted max-w-md mx-auto">
            {search
              ? 'Try changing your search query.'
              : 'Clients who book consultations or have cases opened with you will automatically be organized here.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <div key={client._id} className="panel p-5 flex flex-col justify-between hover:border-chamber-300 transition-colors shadow-sm space-y-4">
              <div className="space-y-4">
                {/* Client info */}
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} src={client.avatar?.url} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink text-base truncate">{client.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {client.cases?.length > 0 && (
                        <Badge variant="primary" size="xs">
                          {client.cases.length} Case{client.cases.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {client.consultations?.length > 0 && (
                        <Badge variant="success" size="xs">
                          {client.consultations.length} Consultation{client.consultations.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 text-xs text-ink-muted border-t border-line pt-3">
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-2 truncate hover:text-chamber-700">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                      <span className="truncate">{client.email}</span>
                    </a>
                  )}
                  {client.phone && (
                    <a href={`tel:${client.phone}`} className="flex items-center gap-2 hover:text-chamber-700">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                      <span>{client.phone}</span>
                    </a>
                  )}
                </div>

                {/* Cases List */}
                {client.cases?.length > 0 && (
                  <div className="space-y-1.5 border-t border-line pt-2">
                    <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block">
                      Active Cases ({client.cases.length})
                    </span>
                    {client.cases.slice(0, 2).map((c) => (
                      <Link
                        key={c._id}
                        to={`/advocate/cases/${c._id}`}
                        className="flex items-center justify-between text-xs text-chamber-700 hover:underline py-0.5"
                      >
                        <span className="truncate flex items-center gap-1">
                          <Scale className="h-3 w-3 shrink-0" />
                          <span className="truncate">{c.title}</span>
                        </span>
                        <span className="text-[10px] text-ink-muted ml-2 shrink-0">{c.status}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Consultations List */}
                {client.consultations?.length > 0 && (
                  <div className="space-y-1.5 border-t border-line pt-2">
                    <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block">
                      Recent Consultations
                    </span>
                    {client.consultations.slice(0, 2).map((cn) => (
                      <div
                        key={cn._id}
                        className="flex items-center justify-between text-xs text-ink-soft py-0.5"
                      >
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-chamber-600" />
                          <span>{format(new Date(cn.date), 'MMM d')} • {cn.timeSlot}</span>
                        </span>
                        <Badge variant={cn.status === 'Confirmed' ? 'success' : 'default'} size="xs">
                          {cn.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Action Footer */}
              <div className="border-t border-line pt-3 flex items-center gap-2">
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => handleOpenCase(client)}
                  className="gap-1 flex-1 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Open New Case
                </Button>
                <Link
                  to={`/advocate/messages?clientId=${client._id}${client.cases?.[0] ? `&caseId=${client.cases[0]._id}` : ''}`}
                  className="p-1.5 rounded-lg border border-line text-ink-muted hover:text-chamber-700 hover:border-chamber-300 hover:bg-paper transition-colors"
                  title="Message Client"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
