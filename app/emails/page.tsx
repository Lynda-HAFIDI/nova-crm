import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../components/sidebar";
import LogoutButton from "../../components/logout-button";
import SendEmailForm from "../../components/send-email-form";

export default async function EmailsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email")
    .order("created_at", { ascending: false });

  const { data: logs } = await supabase
    .from("email_logs")
    .select("*")
    .order("sent_at", { ascending: false });

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Emails</h1>
            <p className="mt-2 text-slate-400">
              Templates et historique des envois
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Envoyer un email</h2>
          <SendEmailForm contacts={contacts || []} templates={templates || []} />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Templates</h2>

          {!templates || templates.length === 0 ? (
            <p>Aucun template</p>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="rounded-xl border border-slate-700 p-4">
                  <h3 className="font-bold">{template.name}</h3>
                  <p className="text-sm text-slate-300">Sujet : {template.subject}</p>
                  <div
                    className="mt-2 text-sm text-slate-400"
                    dangerouslySetInnerHTML={{ __html: template.body_html }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Historique</h2>

          {!logs || logs.length === 0 ? (
            <p>Aucun email envoyé</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-700 p-4">
                  <h3 className="font-bold">{log.subject}</h3>
                  <p className="text-sm text-slate-300">
                    Destinataire : {log.recipient_email}
                  </p>
                  <p className="text-sm text-slate-300">Statut : {log.status}</p>
                  <p className="text-sm text-slate-400">
                    Envoyé le : {new Date(log.sent_at).toLocaleString()}
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