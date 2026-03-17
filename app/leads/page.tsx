import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import { addLead } from "./actions";

export default async function LeadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("*, contacts(first_name,last_name), companies(name)")
    .order("created_at", { ascending: false });

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name")
    .order("created_at", { ascending: false });

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="mt-2 text-slate-400">Gestion des prospects commerciaux</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Ajouter un lead</h2>

          <form action={addLead} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="title"
              placeholder="Titre du lead"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
              required
            />

            <select
              name="status"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
              defaultValue="new"
            >
              <option value="new">Nouveau</option>
              <option value="contacted">Contacté</option>
              <option value="qualified">Qualifié</option>
              <option value="proposal">Proposition</option>
              <option value="negotiation">Négociation</option>
              <option value="converted">Converti</option>
              <option value="lost">Perdu</option>
            </select>

            <select
              name="contact_id"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            >
              <option value="">-- Sélectionner un contact --</option>
              {contacts?.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>

            <select
              name="company_id"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            >
              <option value="">-- Sélectionner une entreprise --</option>
              {companies?.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            <input
              name="source"
              placeholder="Source (site web, Instagram, recommandation...)"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            />

            <input
              name="estimated_value"
              type="number"
              placeholder="Valeur estimée"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            />

            <textarea
              name="notes"
              placeholder="Notes"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2 md:col-span-2"
              rows={4}
            />

            <button
              type="submit"
              className="rounded-lg bg-white p-2 font-semibold text-black md:col-span-2"
            >
              Ajouter le lead
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {!leads || leads.length === 0 ? (
            <p>Aucun lead</p>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-slate-700 p-4">
                  <h2 className="text-lg font-bold">{lead.title}</h2>
                  <p className="text-sm text-slate-300">Statut : {lead.status}</p>
                  <p className="text-sm text-slate-300">Source : {lead.source || "Non renseignée"}</p>
                  <p className="text-sm text-slate-300">
                    Valeur estimée : {lead.estimated_value ?? 0} MAD
                  </p>
                  <p className="text-sm text-slate-300">
                    Contact :{" "}
                    {lead.contacts
                      ? `${lead.contacts.first_name} ${lead.contacts.last_name}`
                      : "Non assigné"}
                  </p>
                  <p className="text-sm text-slate-300">
                    Entreprise : {lead.companies?.name || "Non assignée"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {lead.notes || "Aucune note"}
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