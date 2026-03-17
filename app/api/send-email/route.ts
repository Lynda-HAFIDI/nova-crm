import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, subject, htmlContent, leadId, contactId } = body;

    if (!recipientEmail || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "Champs requis manquants." },
        { status: 400 }
      );
    }

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

    if (!brevoResponse.ok) {
      return NextResponse.json(
        { error: brevoData.message || "Erreur Brevo." },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    await supabase.from("email_logs").insert({
      lead_id: leadId || null,
      contact_id: contactId || null,
      recipient_email: recipientEmail,
      subject,
      body: htmlContent,
      status: "sent",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi." },
      { status: 500 }
    );
  }
}