import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import { addContact, deleteContact, updateContact } from "./actions";
import Link from "next/link";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; company?: string }>;
}) {
  const params = await searchParams;
  const q = params?.q || "";
  const company = params?.company || "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  let contactsQuery = supabase
    .from("contacts")
    .select("*, companies(name)")
    .order("created_at", { ascending: false });

  if (q) {
    contactsQuery = contactsQuery.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  if (company) {
    contactsQuery = contactsQuery.eq("company_id", company);
  }

  const { data: contacts } = await contactsQuery;

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="mt-2 text-slate-400">Gestion complète des contacts</p>
          </div>

          <LogoutButton />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Ajouter un contact</h2>

          <form action={addContact} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="first_name"
              placeholder="Prénom"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
              required
            />

            <input
              name="last_name"
              placeholder="Nom"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
              required
            />

            <input
              name="email"
              placeholder="Email"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            />

            <input
              name="phone"
              placeholder="Téléphone"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            />

            <select
              name="company_id"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2 md:col-span-2"
            >
              <option value="">-- Sélectionner une entreprise --</option>
              {companies?.map((companyItem) => (
                <option key={companyItem.id} value={companyItem.id}>
                  {companyItem.name}
                </option>
              ))}
            </select>

            <textarea
              name="notes"
              placeholder="Notes"
              rows={4}
              className="rounded-lg border border-slate-700 bg-slate-800 p-2 md:col-span-2"
            />

            <button
              type="submit"
              className="rounded-lg bg-white p-2 font-semibold text-black md:col-span-2"
            >
              Ajouter
            </button>
          </form>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Recherche et filtres</h2>

          <form method="GET" className="mt-6 grid gap-4 md:grid-cols-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher par nom ou email"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            />

            <select
              name="company"
              defaultValue={company}
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            >
              <option value="">Toutes les entreprises</option>
              {companies?.map((companyItem) => (
                <option key={companyItem.id} value={companyItem.id}>
                  {companyItem.name}
                </option>
              ))}
            </select>

            <button className="rounded-lg bg-white p-2 font-semibold text-black">
              Filtrer
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {!contacts || contacts.length === 0 ? (
            <p>Aucun contact</p>
          ) : (
            <div className="space-y-6">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-700 p-4"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold">
                        {c.first_name} {c.last_name}
                      </h2>
                      <p className="text-sm text-slate-300">{c.email || "Pas d’email"}</p>
                      <p className="text-sm text-slate-300">{c.phone || "Pas de téléphone"}</p>
                      <p className="text-sm text-slate-300">
                        Entreprise : {c.companies?.name || "Non assignée"}
                      </p>
                    </div>

                    <Link
                      href={`/contacts/${c.id}`}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Voir fiche
                    </Link>
                  </div>

                  <form action={updateContact} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={c.id} />

                    <input
                      name="first_name"
                      defaultValue={c.first_name}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                      required
                    />

                    <input
                      name="last_name"
                      defaultValue={c.last_name}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                      required
                    />

                    <input
                      name="email"
                      defaultValue={c.email || ""}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                    />

                    <input
                      name="phone"
                      defaultValue={c.phone || ""}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2"
                    />

                    <select
                      name="company_id"
                      defaultValue={c.company_id || ""}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2 md:col-span-2"
                    >
                      <option value="">-- Sélectionner une entreprise --</option>
                      {companies?.map((companyItem) => (
                        <option key={companyItem.id} value={companyItem.id}>
                          {companyItem.name}
                        </option>
                      ))}
                    </select>

                    <textarea
                      name="notes"
                      defaultValue={c.notes || ""}
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

                  <form action={deleteContact} className="mt-3">
                    <input type="hidden" name="id" value={c.id} />
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