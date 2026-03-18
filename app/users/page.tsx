import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import { updateUserRole } from "./actions";

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at");

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Utilisateurs</h1>
            <p className="mt-2 text-slate-400">
              Gestion des rôles utilisateurs
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          {!users || users.length === 0 ? (
            <p>Aucun utilisateur</p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-slate-700 p-4"
              >
                <div>
                  <p className="font-semibold">{u.full_name}</p>
                  <p className="text-sm text-slate-400">{u.email}</p>
                </div>

                <form action={updateUserRole} className="flex gap-2">
                  <input type="hidden" name="profile_id" value={u.id} />

                  <select
                    name="role"
                    defaultValue={u.role}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
                  >
                    <option value="admin">admin</option>
                    <option value="sales">sales</option>
                    <option value="standard">standard</option>
                  </select>

                  <button className="rounded-lg bg-white px-4 py-2 font-semibold text-black">
                    Sauvegarder
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}