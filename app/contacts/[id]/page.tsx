import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../../../components/sidebar";
import LogoutButton from "../../../components/logout-button";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: contact } = await supabase
    .from("contacts")
    .select("*, companies(name)")
    .eq("id", id)
    .single();

  if (!contact) {
    redirect("/contacts");
  }

  const { data: emailLogs } = await supabase
    .from("email_logs")
    .select("*")
    .eq("contact_id", id)
    .order("sent_at", { ascending: false });

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {contact.first_name} {contact.last_name}
            </h1>
            <p className="mt-2 text-slate-400">Fiche détaillée du contact</p>
          </div>

          <LogoutButton />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <p><span className="font-semibold">Email :</span> {contact.email || "Non renseigné"}</p>
          <p><span className="font-semibold">Téléphone :</span> {contact.phone || "Non renseigné"}</p>
          <p><span className="font-semibold">Entreprise :</span> {contact.companies?.name || "Non assignée"}</p>
          <p><span className="font-semibold">Notes :</span> {contact.notes || "Aucune note"}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Historique des communications</h2>

          {!emailLogs || emailLogs.length === 0 ? (
            <p>Aucune communication enregistrée</p>
          ) : (
            <div className="space-y-4">
              {emailLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-700 p-4">
                  <h3 className="font-bold">{log.subject}</h3>
                  <p className="text-sm text-slate-300">Destinataire : {log.recipient_email}</p>
                  <p className="text-sm text-slate-300">Statut : {log.status}</p>
                  <p className="mt-2 text-sm text-slate-400">
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