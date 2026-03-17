"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export async function addCompany(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name")?.toString() || "";
  const industry = formData.get("industry")?.toString() || "";
  const city = formData.get("city")?.toString() || "";
  const website = formData.get("website")?.toString() || "";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("companies").insert({
    name,
    industry,
    city,
    website,
    owner_id: user.id,
  });

  redirect("/companies");
}

export async function updateCompany(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString() || "";
  const industry = formData.get("industry")?.toString() || "";
  const city = formData.get("city")?.toString() || "";
  const website = formData.get("website")?.toString() || "";

  if (!id) {
    redirect("/companies");
  }

  await supabase.from("companies").update({
    name,
    industry,
    city,
    website,
  }).eq("id", id);

  redirect("/companies");
}

export async function deleteCompany(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();

  if (!id) {
    redirect("/companies");
  }

  await supabase.from("companies").delete().eq("id", id);

  redirect("/companies");
}