import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import { addContact } from "./actions";

export default async function ContactsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*, companies(name)")
    .order("created_at", { ascending: false });

  const { data: companies } = await supabase.from("companies").select("*");

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="mt-2 text-slate-400">
              Gestion des contacts
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* FORMULAIRE */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Ajouter un contact</h2>

          <form action={addContact} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="first_name"
              placeholder="Prénom"
              className="rounded-lg bg-slate-800 p-2"
              required
            />

            <input
              name="last_name"
              placeholder="Nom"
              className="rounded-lg bg-slate-800 p-2"
              required
            />

            <input
              name="email"
              placeholder="Email"
              className="rounded-lg bg-slate-800 p-2"
            />

            <input
              name="phone"
              placeholder="Téléphone"
              className="rounded-lg bg-slate-800 p-2"
            />

            <select
              name="company_id"
              className="rounded-lg bg-slate-800 p-2 md:col-span-2"
            >
              <option value="">-- Sélectionner une entreprise --</option>
              {companies?.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            <button className="bg-white text-black p-2 rounded md:col-span-2">
              Ajouter
            </button>
          </form>
        </div>

        {/* LISTE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {!contacts || contacts.length === 0 ? (
            <p>Aucun contact</p>
          ) : (
            contacts.map((c) => (
              <div key={c.id} className="border p-4 rounded mb-3">
                <h2 className="font-bold">
                  {c.first_name} {c.last_name}
                </h2>
                <p>{c.email}</p>
                <p>{c.phone}</p>
                <p>
                  Entreprise :{" "}
                  {c.companies?.name || "Non assignée"}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}