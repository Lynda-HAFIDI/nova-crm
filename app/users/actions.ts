"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient();

  const profileId = formData.get("profile_id")?.toString();
  const role = formData.get("role")?.toString();

  if (!profileId || !role) redirect("/users");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") {
    redirect("/dashboard");
  }

  await supabase.from("profiles").update({ role }).eq("id", profileId);

  redirect("/users");
}