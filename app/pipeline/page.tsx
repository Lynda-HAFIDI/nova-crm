import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";

const columns = [
  { key: "new", label: "Nouveau" },
  { key: "contacted", label: "Contacté" },
  { key: "qualified", label: "Qualifié" },
  { key: "proposal", label: "Proposition" },
  { key: "negotiation", label: "Négociation" },
  { key: "converted", label: "Converti" },
  { key: "lost", label: "Perdu" },
];

export default async function PipelinePage() {
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

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pipeline commercial</h1>
            <p className="mt-2 text-slate-400">
              Vue des leads par statut
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-4 xl:grid-cols-4 2xl:grid-cols-7">
          {columns.map((column) => {
            const filteredLeads =
              leads?.filter((lead) => lead.status === column.key) || [];

            return (
              <div
                key={column.key}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">{column.label}</h2>
                  <p className="text-sm text-slate-400">
                    {filteredLeads.length} lead(s)
                  </p>
                </div>

                <div className="space-y-3">
                  {filteredLeads.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun lead</p>
                  ) : (
                    filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-xl border border-slate-700 bg-slate-950 p-4"
                      >
                        <h3 className="font-semibold">{lead.title}</h3>

                        <p className="mt-2 text-sm text-slate-300">
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
                          Valeur : {lead.estimated_value ?? 0} MAD
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}