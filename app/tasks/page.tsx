import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import { addTask, updateTaskStatus } from "./actions";
import TasksCalendar from "../../components/tasks-calendar";

const columns = [
  { key: "todo", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "done", label: "Terminée" },
  { key: "late", label: "En retard" },
];

function getPriorityLabel(priority: string) {
  if (priority === "high") return "Haute";
  if (priority === "medium") return "Moyenne";
  return "Basse";
}

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urgentTasks =
    tasks?.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays >= 0 && diffDays <= 2;
    }) || [];

  const lateTasks =
    tasks?.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      return due < today || task.status === "late";
    }) || [];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tâches</h1>
            <p className="mt-2 text-slate-400">
              Gestion, calendrier et échéances
            </p>
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

        <div className="mb-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Calendrier des tâches</h2>
            <TasksCalendar tasks={tasks || []} />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">Tâches urgentes</h2>
              {!urgentTasks.length ? (
                <p className="text-slate-400">Aucune tâche urgente</p>
              ) : (
                <div className="space-y-3">
                  {urgentTasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-slate-700 p-4">
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-slate-400">
                        Date limite : {task.due_date || "Non définie"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Priorité : {getPriorityLabel(task.priority)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">Tâches en retard</h2>
              {!lateTasks.length ? (
                <p className="text-slate-400">Aucune tâche en retard</p>
              ) : (
                <div className="space-y-3">
                  {lateTasks.map((task) => (
                    <div key={task.id} className="rounded-xl border border-slate-700 p-4">
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-slate-400">
                        Date limite : {task.due_date || "Non définie"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Lead : {task.leads?.title || "Aucun"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => {
            const filteredTasks =
              tasks?.filter((task) => task.status === column.key) || [];

            return (
              <div
                key={column.key}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">{column.label}</h2>
                  <p className="text-sm text-slate-400">
                    {filteredTasks.length} tâche(s)
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucune tâche</p>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-700 bg-slate-950 p-4"
                      >
                        <h3 className="text-base font-bold">{task.title}</h3>

                        <div className="mt-3 space-y-1 text-sm text-slate-300">
                          <p>Priorité : {getPriorityLabel(task.priority)}</p>
                          <p>Date limite : {task.due_date || "Non définie"}</p>
                          <p>Lead lié : {task.leads?.title || "Aucun"}</p>
                        </div>

                        <p className="mt-3 text-sm text-slate-400">
                          {task.description || "Aucune description"}
                        </p>

                        <form action={updateTaskStatus} className="mt-4 space-y-2">
                          <input type="hidden" name="task_id" value={task.id} />

                          <select
                            name="status"
                            defaultValue={task.status}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-sm"
                          >
                            <option value="todo">À faire</option>
                            <option value="in_progress">En cours</option>
                            <option value="done">Terminée</option>
                            <option value="late">En retard</option>
                          </select>

                          <button
                            type="submit"
                            className="w-full rounded-lg bg-white p-2 text-sm font-semibold text-black"
                          >
                            Mettre à jour
                          </button>
                        </form>
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