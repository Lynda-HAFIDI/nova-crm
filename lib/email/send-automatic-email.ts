import { createClient } from "../supabase/server";

type SendAutomaticEmailParams = {
  recipientEmail: string;
  subject: string;
  htmlContent: string;
  leadId?: string | null;
  contactId?: string | null;
};

export async function sendAutomaticEmail({
  recipientEmail,
  subject,
  htmlContent,
  leadId = null,
  contactId = null,
}: SendAutomaticEmailParams) {
  if (!recipientEmail || !subject || !htmlContent) return;

  const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL!,
        name: "Nova CRM",
      },
      to: [{ email: recipientEmail }],
      subject,
      htmlContent,
    }),
  });

  const brevoData = await brevoResponse.json();

  const supabase = await createClient();

  await supabase.from("email_logs").insert({
    lead_id: leadId,
    contact_id: contactId,
    recipient_email: recipientEmail,
    subject,
    body: htmlContent,
    status: brevoResponse.ok ? "sent" : `failed: ${brevoData?.message || "error"}`,
  });

  return {
    ok: brevoResponse.ok,
    data: brevoData,
  };
}