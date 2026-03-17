"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export async function addContact(formData: FormData) {
  const supabase = await createClient();

  const first_name = formData.get("first_name")?.toString() || "";
  const last_name = formData.get("last_name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const company_id = formData.get("company_id")?.toString() || null;
  const notes = formData.get("notes")?.toString() || "";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("contacts").insert({
    first_name,
    last_name,
    email,
    phone,
    company_id,
    notes,
    owner_id: user.id,
  });

  redirect("/contacts");
}

export async function updateContact(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();
  const first_name = formData.get("first_name")?.toString() || "";
  const last_name = formData.get("last_name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const company_id = formData.get("company_id")?.toString() || null;
  const notes = formData.get("notes")?.toString() || "";

  if (!id) {
    redirect("/contacts");
  }

  await supabase.from("contacts").update({
    first_name,
    last_name,
    email,
    phone,
    company_id,
    notes,
  }).eq("id", id);

  redirect("/contacts");
}

export async function deleteContact(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();

  if (!id) {
    redirect("/contacts");
  }

  await supabase.from("contacts").delete().eq("id", id);

  redirect("/contacts");
}