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

  const [{ count: companiesCount }, { count: contactsCount }, { count: leadsCount }, { count: tasksCount }] =
    await Promise.all([
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase.from("contacts").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }),
    ]);

  const { data: leadsData } = await supabase.from("leads").select("status");

  const convertedCount =
    leadsData?.filter((lead) => lead.status === "converted").length || 0;

  const lostCount =
    leadsData?.filter((lead) => lead.status === "lost").length || 0;

  const conversionRate =
    leadsCount && leadsCount > 0
      ? ((convertedCount / leadsCount) * 100).toFixed(1)
      : "0.0";

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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Entreprises</h2>
            <p className="mt-2 text-3xl font-bold">{companiesCount ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Contacts</h2>
            <p className="mt-2 text-3xl font-bold">{contactsCount ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Leads</h2>
            <p className="mt-2 text-3xl font-bold">{leadsCount ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Tâches</h2>
            <p className="mt-2 text-3xl font-bold">{tasksCount ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Leads convertis</h2>
            <p className="mt-2 text-3xl font-bold">{convertedCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Leads perdus</h2>
            <p className="mt-2 text-3xl font-bold">{lostCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">
            <h2 className="text-sm text-slate-400">Taux de conversion</h2>
            <p className="mt-2 text-3xl font-bold">{conversionRate}%</p>
          </div>
        </div>
      </main>
    </div>
  );
}