import { BookOpen, ExternalLink } from 'lucide-react';

const RESOURCES = [
  { category: 'Family Law', items: [
    { title: 'Hindu Marriage Act, 1955', url: 'https://legislative.gov.in/', desc: 'Governs marriage and divorce for Hindus' },
    { title: 'Special Marriage Act, 1954', url: 'https://legislative.gov.in/', desc: 'Enables marriages between persons of different faiths' },
    { title: 'Protection of Women from Domestic Violence Act', url: 'https://legislative.gov.in/', desc: 'Protection orders and remedies for domestic violence victims' },
  ]},
  { category: 'Consumer Rights', items: [
    { title: 'Consumer Protection Act, 2019', url: 'https://consumerhelpline.gov.in/', desc: 'Rights and remedies for consumers' },
    { title: 'National Consumer Disputes Redressal Commission', url: 'https://ncdrc.nic.in/', desc: 'Online complaint filing portal' },
  ]},
  { category: 'Cyber Law', items: [
    { title: 'IT Act 2000 & Amendments', url: 'https://legislative.gov.in/', desc: 'Legal framework for electronic commerce and cybercrime' },
    { title: 'Cybercrime Reporting Portal', url: 'https://cybercrime.gov.in/', desc: 'File cybercrime complaints online — cybercrime.gov.in' },
  ]},
  { category: 'Labour Law', items: [
    { title: 'Industrial Disputes Act, 1947', url: 'https://legislative.gov.in/', desc: 'Governs disputes between employers and employees' },
    { title: 'Employees Provident Fund Organisation', url: 'https://epfindia.gov.in/', desc: 'PF withdrawal, transfer and grievance portal' },
  ]},
  { category: 'Useful Portals', items: [
    { title: 'National Legal Services Authority (NALSA)', url: 'https://nalsa.gov.in/', desc: 'Free legal aid for eligible citizens' },
    { title: 'eCourts India', url: 'https://ecourts.gov.in/', desc: 'Track case status in Indian courts' },
    { title: 'Bar Council of India', url: 'https://www.barcouncilofindia.org/', desc: 'Verify advocate registration and credentials' },
  ]},
];

export default function LegalResources() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="h-8 w-8 text-chamber-600" />
        <h1 className="text-4xl">Legal Resources</h1>
      </div>
      <p className="mt-2 text-ink-soft mb-10">
        Curated links to Indian laws, government portals, and free legal aid resources.
        <br />
        <span className="text-xs text-ink-muted">These are general information resources only. For advice on your specific situation, consult a qualified advocate.</span>
      </p>

      <div className="space-y-8">
        {RESOURCES.map(({ category, items }) => (
          <div key={category}>
            <h2 className="text-xl mb-4 pb-2 border-b border-line">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panel p-4 hover:border-chamber-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-chamber-700 group-hover:text-chamber-900">{item.title}</h3>
                    <ExternalLink className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
