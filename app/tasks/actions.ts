"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export async function addTask(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const due_date = formData.get("due_date")?.toString() || null;
  const priority = formData.get("priority")?.toString() || "medium";
  const status = formData.get("status")?.toString() || "todo";
  const lead_id = formData.get("lead_id")?.toString() || null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("tasks").insert({
    title,
    description,
    due_date,
    priority,
    status,
    lead_id,
    assigned_to: user.id,
  });

  redirect("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const supabase = await createClient();

  const taskId = formData.get("task_id")?.toString();
  const status = formData.get("status")?.toString();

  if (!taskId || !status) {
    redirect("/tasks");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  redirect("/tasks");
}