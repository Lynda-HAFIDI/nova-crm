import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import { addLead, deleteLead, updateLead, updateLeadStatus } from "./actions";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; source?: string }>;
}) {
  const params = await searchParams;
  const selectedStatus = params?.status || "";
  const selectedSource = params?.source || "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let leadsQuery = supabase
    .from("leads")
    .select("*, contacts(first_name,last_name), companies(name)")
    .order("created_at", { ascending: false });

  if (selectedStatus) {
    leadsQuery = leadsQuery.eq("status", selectedStatus);
  }

  if (selectedSource) {
    leadsQuery = leadsQuery.eq("source", selectedSource);
  }

  const { data: leads } = await leadsQuery;

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name")
    .order("created_at", { ascending: false });

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("created_at", { ascending: false });

  const { data: allSourcesData } = await supabase
    .from("leads")
    .select("source");

  const uniqueSources = Array.from(
    new Set(
      (allSourcesData || [])
        .map((lead) => lead.source)
        .filter((source): source is string => Boolean(source))
    )
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="mt-2 text-slate-400">Gestion complète des prospects commerciaux</p>
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

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Filtres</h2>

          <form method="GET" className="mt-6 grid gap-4 md:grid-cols-3">
            <select
              name="status"
              defaultValue={selectedStatus}
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            >
              <option value="">Tous les statuts</option>
              <option value="new">Nouveau</option>
              <option value="contacted">Contacté</option>
              <option value="qualified">Qualifié</option>
              <option value="proposal">Proposition</option>
              <option value="negotiation">Négociation</option>
              <option value="converted">Converti</option>
              <option value="lost">Perdu</option>
            </select>

            <select
              name="source"
              defaultValue={selectedSource}
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            >
              <option value="">Toutes les sources</option>
              {uniqueSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <button className="rounded-lg bg-white p-2 font-semibold text-black">
              Filtrer
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {!leads || leads.length === 0 ? (
            <p>Aucun lead</p>
          ) : (
            <div className="space-y-6">
              {leads.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-slate-700 p-4">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold">{lead.title}</h2>
                      <p className="text-sm text-slate-300">
                        Contact :{" "}
                        {lead.contacts
                          ? `${lead.contacts.first_name} ${lead.contacts.last_name}`
                          : "Non assigné"}
                      </p>
                      <p className="text-sm text-slate-300">
                        Entreprise : {lead.companies?.name || "Non assignée"}
                      </p>
                      <p className="text-sm text-slate-300">
                        Source : {lead.source || "Non renseignée"}
                      </p>
                      <p className="text-sm text-slate-300">
                        Valeur estimée : {lead.estimated_value ?? 0} MAD
                      </p>
                    </div>

                    <form action={updateLeadStatus} className="flex gap-2">
                      <input type="hidden" name="id" value={lead.id} />
                      <select
                        name="status"
                        defaultValue={lead.status}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                      >
                        <option value="new">Nouveau</option>
                        <option value="contacted">Contacté</option>
                        <option value="qualified">Qualifié</option>
                        <option value="proposal">Proposition</option>
                        <option value="negotiation">Négociation</option>
                        <option value="converted">Converti</option>
                        <option value="lost">Perdu</option>
                      </select>
                      <button className="rounded-lg bg-white px-4 py-2 font-semibold text-black">
                        Statut
                      </button>
                    </form>
                  </div>

                  <form action={updateLead} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={lead.id} />

                    <input
                      name="title"
                      defaultValue={lead.title}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                      required
                    />

                    <input
                      name="source"
                      defaultValue={lead.source || ""}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                    />

                    <select
                      name="status"
                      defaultValue={lead.status}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                    >
                      <option value="new">Nouveau</option>
                      <option value="contacted">Contacté</option>
                      <option value="qualified">Qualifié</option>
                      <option value="proposal">Proposition</option>
                      <option value="negotiation">Négociation</option>
                      <option value="converted">Converti</option>
                      <option value="lost">Perdu</option>
                    </select>

                    <input
                      name="estimated_value"
                      type="number"
                      defaultValue={lead.estimated_value ?? 0}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                    />

                    <select
                      name="contact_id"
                      defaultValue={lead.contact_id || ""}
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
                      defaultValue={lead.company_id || ""}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                    >
                      <option value="">-- Sélectionner une entreprise --</option>
                      {companies?.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>

                    <textarea
                      name="notes"
                      defaultValue={lead.notes || ""}
                      rows={3}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2 md:col-span-2"
                    />

                    <div className="flex gap-3 md:col-span-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-white px-4 py-2 font-semibold text-black"
                      >
                        Modifier
                      </button>
                    </div>
                  </form>

                  <form action={deleteLead} className="mt-3">
                    <input type="hidden" name="id" value={lead.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}