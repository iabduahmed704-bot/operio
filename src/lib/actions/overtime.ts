"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SubmitOvertimeResult = { error: string } | { error?: undefined };

export async function submitOvertime(formData: FormData): Promise<SubmitOvertimeResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const hours = Number(formData.get("hours") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();

  if (hours <= 0 || !reason) return { error: "Hours and reason are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("overtime_records").insert({
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    employee_id: user.id,
    submitted_by: user.id,
    hours,
    reason,
  });

  if (error) return { error: error.message };

  revalidatePath("/overtime");
  return {};
}

export type ReviewOvertimeResult = { error: string } | { error?: undefined };

export async function reviewOvertime(id: string, approve: boolean): Promise<ReviewOvertimeResult> {
  const user = await requireAuth();
  if (!["organization_owner", "operations_manager", "branch_manager"].includes(user.org_role ?? "")) {
    return { error: "You don't have permission to review overtime." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("overtime_records")
    .update({
      status: approve ? "approved" : "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/overtime");
  return {};
}
