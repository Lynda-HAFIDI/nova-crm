import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Nova CRM</h1>
            <p className="mt-2 text-slate-400">Bienvenue {user.email}</p>
          </div>

          <LogoutButton />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <p className="mt-2 text-slate-400">À connecter bientôt</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Leads</h2>
            <p className="mt-2 text-slate-400">À connecter bientôt</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Tâches</h2>
            <p className="mt-2 text-slate-400">À connecter bientôt</p>
          </div>
        </div>
      </main>
    </div>
  );
}