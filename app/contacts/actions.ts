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
    owner_id: user.id,
  });

  redirect("/contacts");
}