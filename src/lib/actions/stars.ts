"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { currentWeekLabel, currentMonthLabel } from "@/lib/period";

export type AwardStarResult = { error: string } | { error?: undefined };

export async function awardStar(formData: FormData): Promise<AwardStarResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }
  if (!["organization_owner", "operations_manager", "branch_manager", "supervisor"].includes(user.org_role ?? "")) {
    return { error: "You don't have permission to award stars." };
  }

  const employeeId = String(formData.get("employeeId") ?? "");
  const period = String(formData.get("period") ?? "week") as "week" | "month";
  const note = String(formData.get("note") ?? "").trim();

  if (!employeeId) return { error: "Select an employee." };

  const periodLabel = period === "week" ? currentWeekLabel() : currentMonthLabel();

  const supabase = await createClient();
  const { error } = await supabase.from("stars").upsert(
    {
      organization_id: user.organization_id,
      branch_id: user.branch_id,
      employee_id: employeeId,
      period,
      period_label: periodLabel,
      note: note || null,
      awarded_by: user.id,
    },
    { onConflict: "organization_id,branch_id,period,period_label" }
  );

  if (error) return { error: error.message };

  revalidatePath("/stars");
  return {};
}
