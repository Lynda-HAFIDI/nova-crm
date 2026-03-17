import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import FunnelChart from "../../components/funnel-chart";
import SourceChart from "../../components/source-chart";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { count: companiesCount },
    { count: contactsCount },
    { count: leadsCount },
    { count: tasksCount },
    { count: emailsCount },
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("email_logs").select("*", { count: "exact", head: true }),
  ]);

  const { data: leadsData } = await supabase
    .from("leads")
    .select("status, source, estimated_value");

  const { data: tasksData } = await supabase
    .from("tasks")
    .select("status, due_date");

  const convertedCount =
    leadsData?.filter((lead) => lead.status === "converted").length || 0;

  const lostCount =
    leadsData?.filter((lead) => lead.status === "lost").length || 0;

  const conversionRate =
    leadsCount && leadsCount > 0
      ? ((convertedCount / leadsCount) * 100).toFixed(1)
      : "0.0";

  const funnelData = [
    { name: "Nouveau", value: leadsData?.filter((l) => l.status === "new").length || 0 },
    { name: "Contacté", value: leadsData?.filter((l) => l.status === "contacted").length || 0 },
    { name: "Qualifié", value: leadsData?.filter((l) => l.status === "qualified").length || 0 },
    { name: "Proposition", value: leadsData?.filter((l) => l.status === "proposal").length || 0 },
    { name: "Négociation", value: leadsData?.filter((l) => l.status === "negotiation").length || 0 },
    { name: "Converti", value: convertedCount },
    { name: "Perdu", value: lostCount },
  ];

  const sourceStatsMap = new Map<string, number>();

  (leadsData || []).forEach((lead) => {
    const source = lead.source || "Non renseignée";
    sourceStatsMap.set(source, (sourceStatsMap.get(source) || 0) + 1);
  });

  const sourceData = Array.from(sourceStatsMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const pipelineAmount =
    (leadsData || [])
      .filter((lead) => lead.status !== "lost")
      .reduce((sum, lead) => sum + Number(lead.estimated_value || 0), 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lateTasksCount =
    tasksData?.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }).length || 0;

  const urgentTasksCount =
    tasksData?.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);

      const diffMs = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return diffDays >= 0 && diffDays <= 2;
    }).length || 0;

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
            <h2 className="text-sm text-slate-400">Emails envoyés</h2>
            <p className="mt-2 text-3xl font-bold">{emailsCount ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Leads convertis</h2>
            <p className="mt-2 text-3xl font-bold">{convertedCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Leads perdus</h2>
            <p className="mt-2 text-3xl font-bold">{lostCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Taux de conversion</h2>
            <p className="mt-2 text-3xl font-bold">{conversionRate}%</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Tâches urgentes</h2>
            <p className="mt-2 text-3xl font-bold">{urgentTasksCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-sm text-slate-400">Tâches en retard</h2>
            <p className="mt-2 text-3xl font-bold">{lateTasksCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">
            <h2 className="text-sm text-slate-400">Montant total du pipeline</h2>
            <p className="mt-2 text-3xl font-bold">{pipelineAmount} MAD</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Funnel de conversion</h2>
            <FunnelChart data={funnelData} />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Leads par source</h2>
            <SourceChart data={sourceData} />
          </div>
        </div>
      </main>
    </div>
  );
}