import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import { addTask } from "./actions";

export default async function TasksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, leads(title)")
    .order("created_at", { ascending: false });

  const { data: leads } = await supabase
    .from("leads")
    .select("id, title")
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tâches</h1>
            <p className="mt-2 text-slate-400">Gestion des tâches commerciales</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Ajouter une tâche</h2>

          <form action={addTask} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="title"
              placeholder="Titre de la tâche"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
              required
            />

            <input
              name="due_date"
              type="date"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
            />

            <select
              name="priority"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
              defaultValue="medium"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>

            <select
              name="status"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2"
              defaultValue="todo"
            >
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="done">Terminée</option>
              <option value="late">En retard</option>
            </select>

            <select
              name="lead_id"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2 md:col-span-2"
            >
              <option value="">-- Sélectionner un lead --</option>
              {leads?.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.title}
                </option>
              ))}
            </select>

            <textarea
              name="description"
              placeholder="Description"
              rows={4}
              className="rounded-lg border border-slate-700 bg-slate-800 p-2 md:col-span-2"
            />

            <button
              type="submit"
              className="rounded-lg bg-white p-2 font-semibold text-black md:col-span-2"
            >
              Ajouter la tâche
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {!tasks || tasks.length === 0 ? (
            <p>Aucune tâche</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-700 p-4">
                  <h2 className="text-lg font-bold">{task.title}</h2>
                  <p className="text-sm text-slate-300">
                    Priorité : {task.priority}
                  </p>
                  <p className="text-sm text-slate-300">
                    Statut : {task.status}
                  </p>
                  <p className="text-sm text-slate-300">
                    Date limite : {task.due_date || "Non définie"}
                  </p>
                  <p className="text-sm text-slate-300">
                    Lead lié : {task.leads?.title || "Aucun"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {task.description || "Aucune description"}
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