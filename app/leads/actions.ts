"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

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

  await supabase.from("leads").insert({
    title,
    contact_id,
    company_id,
    assigned_to: user.id,
    status,
    source,
    estimated_value,
    notes,
  });

  redirect("/leads");
}