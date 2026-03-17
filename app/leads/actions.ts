"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import { sendAutomaticEmail } from "../../lib/email/send-automatic-email";

export async function addLead(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title")?.toString() || "";
  const contact_id = formData.get("contact_id")?.toString() || null;
  const company_id = formData.get("company_id")?.toString() || null;
  const status = formData.get("status")?.toString() || "new";
  const source = formData.get("source")?.toString() || "";
  const estimated_value = Number(formData.get("estimated_value")?.toString() || "0");
  const notes = formData.get("notes")?.toString() || "";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: insertedLead } = await supabase
    .from("leads")
    .insert({
      title,
      contact_id,
      company_id,
      assigned_to: user.id,
      status,
      source,
      estimated_value,
      notes,
    })
    .select()
    .single();

  if (contact_id) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, first_name, email")
      .eq("id", contact_id)
      .single();

    if (contact?.email) {
      await sendAutomaticEmail({
        recipientEmail: contact.email,
        subject: "Merci pour votre demande",
        htmlContent: `
          <p>Bonjour ${contact.first_name || ""},</p>
          <p>Merci pour votre intérêt pour nos services.</p>
          <p>Votre demande a bien été prise en compte et notre équipe reviendra vers vous très prochainement.</p>
          <p>Cordialement,<br>Nova CRM</p>
        `,
        leadId: insertedLead?.id || null,
        contactId: contact.id,
      });
    }
  }

  redirect("/leads");
}

export async function updateLead(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString() || "";
  const contact_id = formData.get("contact_id")?.toString() || null;
  const company_id = formData.get("company_id")?.toString() || null;
  const status = formData.get("status")?.toString() || "new";
  const source = formData.get("source")?.toString() || "";
  const estimated_value = Number(formData.get("estimated_value")?.toString() || "0");
  const notes = formData.get("notes")?.toString() || "";

  if (!id) {
    redirect("/leads");
  }

  await supabase.from("leads").update({
    title,
    contact_id,
    company_id,
    status,
    source,
    estimated_value,
    notes,
  }).eq("id", id);

  redirect("/leads");
}

export async function updateLeadStatus(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || !status) {
    redirect("/leads");
  }

  const { data: leadBefore } = await supabase
    .from("leads")
    .select("id, status, contact_id, title")
    .eq("id", id)
    .single();

  await supabase.from("leads").update({ status }).eq("id", id);

  if (status === "qualified" && leadBefore?.contact_id) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, first_name, email")
      .eq("id", leadBefore.contact_id)
      .single();

    if (contact?.email) {
      await sendAutomaticEmail({
        recipientEmail: contact.email,
        subject: "Votre projet est en cours de qualification",
        htmlContent: `
          <p>Bonjour ${contact.first_name || ""},</p>
          <p>Bonne nouvelle : votre projet <strong>${leadBefore.title}</strong> est actuellement en cours de qualification par notre équipe.</p>
          <p>Nous reviendrons vers vous rapidement avec les prochaines étapes.</p>
          <p>Cordialement,<br>Nova CRM</p>
        `,
        leadId: leadBefore.id,
        contactId: contact.id,
      });
    }
  }

  redirect("/leads");
}

export async function deleteLead(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();

  if (!id) {
    redirect("/leads");
  }

  await supabase.from("leads").delete().eq("id", id);

  redirect("/leads");
}