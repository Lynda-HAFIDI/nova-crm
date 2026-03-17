"use client";

import { useState } from "react";

type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
};

type Template = {
  id: string;
  name: string;
  subject: string;
  body_html: string;
};

export default function SendEmailForm({
  contacts,
  templates,
}: {
  contacts: Contact[];
  templates: Template[];
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [contactId, setContactId] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [message, setMessage] = useState("");

  const handleTemplateChange = (templateId: string) => {
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (!selectedTemplate) return;

    setSubject(selectedTemplate.subject);
    setHtmlContent(selectedTemplate.body_html);
  };

  const handleContactChange = (selectedContactId: string) => {
    setContactId(selectedContactId);
    const selectedContact = contacts.find((c) => c.id === selectedContactId);
    if (!selectedContact) return;

    setRecipientEmail(selectedContact.email || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Envoi en cours...");

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipientEmail, subject, htmlContent, contactId }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Erreur lors de l'envoi.");
      return;
    }

    setMessage("Email envoyé avec succès.");
    setRecipientEmail("");
    setContactId("");
    setSubject("");
    setHtmlContent("");
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <select
        onChange={(e) => handleContactChange(e.target.value)}
        value={contactId}
        className="rounded-lg border border-slate-700 bg-slate-800 p-2"
      >
        <option value="">-- Sélectionner un contact --</option>
        {contacts.map((contact) => (
          <option key={contact.id} value={contact.id}>
            {contact.first_name} {contact.last_name}
          </option>
        ))}
      </select>

      <input
        type="email"
        placeholder="Email destinataire"
        value={recipientEmail}
        onChange={(e) => setRecipientEmail(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 p-2"
        required
      />

      <select
        onChange={(e) => handleTemplateChange(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 p-2"
      >
        <option value="">-- Choisir un template --</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Sujet"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 p-2"
        required
      />

      <textarea
        placeholder="Contenu HTML"
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        rows={8}
        className="rounded-lg border border-slate-700 bg-slate-800 p-2"
        required
      />

      {message && <p className="text-sm text-slate-300">{message}</p>}

      <button
        type="submit"
        className="rounded-lg bg-white p-2 font-semibold text-black"
      >
        Envoyer l’email
      </button>
    </form>
  );
}