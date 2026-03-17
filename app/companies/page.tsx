import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import { addCompany, deleteCompany, updateCompany } from "./actions";
import Link from "next/link";

export default async function CompaniesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Entreprises</h1>
            <p className="mt-2 text-slate-400">
              Gestion complète des entreprises partenaires
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Ajouter une entreprise</h2>

          <form action={addCompany} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              type="text"
              placeholder="Nom de l'entreprise"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none"
              required
            />

            <input
              name="industry"
              type="text"
              placeholder="Secteur"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none"
            />

            <input
              name="city"
              type="text"
              placeholder="Ville"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none"
            />

            <input
              name="website"
              type="text"
              placeholder="Site web"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none"
            />

            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 md:col-span-2"
            >
              Ajouter l’entreprise
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {error && (
            <p className="mb-4 text-red-400">
              Erreur lors du chargement des entreprises.
            </p>
          )}

          {!companies || companies.length === 0 ? (
            <p className="text-slate-400">Aucune entreprise pour le moment.</p>
          ) : (
            <div className="space-y-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="rounded-xl border border-slate-700 p-4"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{company.name}</h2>
                      <p className="text-sm text-slate-400">
                        Secteur : {company.industry || "Non renseigné"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Ville : {company.city || "Non renseignée"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Site web : {company.website || "Non renseigné"}
                      </p>
                    </div>

                    <Link
                      href={`/companies/${company.id}`}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Voir fiche
                    </Link>
                  </div>

                  <form action={updateCompany} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={company.id} />

                    <input
                      name="name"
                      defaultValue={company.name}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                      required
                    />

                    <input
                      name="industry"
                      defaultValue={company.industry || ""}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                    />

                    <input
                      name="city"
                      defaultValue={company.city || ""}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                    />

                    <input
                      name="website"
                      defaultValue={company.website || ""}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
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

                  <form action={deleteCompany} className="mt-3">
                    <input type="hidden" name="id" value={company.id} />
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