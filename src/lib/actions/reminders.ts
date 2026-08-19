"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ReminderResult = { error: string } | { error?: undefined };

function addInterval(date: Date, recurrence: string): Date {
  const next = new Date(date);
  if (recurrence === "daily") next.setDate(next.getDate() + 1);
  else if (recurrence === "weekly") next.setDate(next.getDate() + 7);
  else if (recurrence === "monthly") next.setMonth(next.getMonth() + 1);
  return next;
}

export async function createReminder(formData: FormData): Promise<ReminderResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "other");
  const recurrence = String(formData.get("recurrence") ?? "once");
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!title || !dueDate) return { error: "Title and due date are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("reminders").insert({
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    title,
    category,
    recurrence,
    next_due_at: new Date(dueDate).toISOString(),
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/reminders");
  return {};
}

export async function completeReminder(id: string): Promise<ReminderResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };

  const supabase = await createClient();
  const { data: reminder, error: fetchError } = await supabase
    .from("reminders")
    .select("recurrence, next_due_at")
    .eq("id", id)
    .eq("organization_id", user.organization_id)
    .maybeSingle();

  if (fetchError || !reminder) return { error: fetchError?.message ?? "Reminder not found." };

  const now = new Date();
  const isRecurring = reminder.recurrence !== "once";
  const nextDue = isRecurring ? addInterval(now, reminder.recurrence) : new Date(reminder.next_due_at);

  const { error } = await supabase
    .from("reminders")
    .update({
      last_done_at: now.toISOString(),
      last_done_by: user.id,
      next_due_at: isRecurring ? nextDue.toISOString() : reminder.next_due_at,
    })
    .eq("id", id)
    .eq("organization_id", user.organization_id);

  if (error) return { error: error.message };

  if (!isRecurring) {
    await supabase.from("reminders").delete().eq("id", id).eq("organization_id", user.organization_id);
  }

  revalidatePath("/reminders");
  return {};
}
