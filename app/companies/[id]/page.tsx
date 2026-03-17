import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../../components/sidebar";
import LogoutButton from "../../../components/logout-button";
import Link from "next/link";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (!company) {
    redirect("/companies");
  }

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("company_id", id)
    .order("created_at", { ascending: false });

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("company_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="mt-2 text-slate-400">Fiche détaillée entreprise</p>
          </div>

          <LogoutButton />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <p><span className="font-semibold">Secteur :</span> {company.industry || "Non renseigné"}</p>
          <p><span className="font-semibold">Ville :</span> {company.city || "Non renseignée"}</p>
          <p><span className="font-semibold">Site web :</span> {company.website || "Non renseigné"}</p>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Contacts associés</h2>

          {!contacts || contacts.length === 0 ? (
            <p>Aucun contact associé</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="rounded-xl border border-slate-700 p-4">
                  <p className="font-semibold">
                    {contact.first_name} {contact.last_name}
                  </p>
                  <p className="text-sm text-slate-400">{contact.email || "Pas d’email"}</p>
                  <p className="text-sm text-slate-400">{contact.phone || "Pas de téléphone"}</p>
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="mt-3 inline-block rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Voir contact
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Leads associés</h2>

          {!leads || leads.length === 0 ? (
            <p>Aucun lead associé</p>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-slate-700 p-4">
                  <p className="font-semibold">{lead.title}</p>
                  <p className="text-sm text-slate-400">Statut : {lead.status}</p>
                  <p className="text-sm text-slate-400">
                    Valeur estimée : {lead.estimated_value ?? 0} MAD
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}