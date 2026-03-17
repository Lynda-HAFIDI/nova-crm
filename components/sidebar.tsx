import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/companies", label: "Entreprises" },
  { href: "/contacts", label: "Contacts" },
  { href: "/leads", label: "Leads" },
  { href: "/tasks", label: "Tâches" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/emails", label: "Emails" },
];

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-slate-800 bg-slate-900 p-6 text-white">
      <h2 className="text-2xl font-bold">Nova CRM</h2>
      <p className="mt-1 text-sm text-slate-400">
        Agence marketing digitale
      </p>

      <nav className="mt-8 flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}