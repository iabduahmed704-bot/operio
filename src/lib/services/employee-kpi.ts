import "server-only";
import { createClient } from "@/lib/supabase/server";
import { currentWeekLabel } from "@/lib/period";

export type EmployeeKpi = {
  employeeId: string;
  fullName: string;
  score: number;
  breakdown: {
    taskCompletionPct: number;
    checklistCompletionPct: number;
    reportsFiled: number;
    tillAccuracyPct: number;
  };
};

const WEIGHTS = {
  taskCompletion: 0.35,
  checklistCompletion: 0.3,
  reportsFiled: 0.15,
  tillAccuracy: 0.2,
};

// Computes a 0-100 KPI score per employee for the current week, from data
// already captured elsewhere in the app (tasks, checklist submissions,
// incident/OOS reports, till handovers). Used to suggest a Star of the Week
// candidate — a manager still has to award it, this never auto-awards.
export async function getEmployeeKpisForBranch(
  organizationId: string,
  branchId: string
): Promise<EmployeeKpi[]> {
  const supabase = await createClient();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartIso = weekStart.toISOString();

  const [employees, tasks, checklistSubs, incidents, oos, tillHandovers] = await Promise.all([
    supabase
      .from("users")
      .select("id, full_name")
      .eq("organization_id", organizationId)
      .eq("branch_id", branchId)
      .eq("is_active", true),
    supabase
      .from("tasks")
      .select("assigned_to, status")
      .eq("organization_id", organizationId)
      .eq("branch_id", branchId)
      .gte("created_at", weekStartIso),
    supabase
      .from("checklist_submissions")
      .select("submitted_by")
      .eq("organization_id", organizationId)
      .eq("branch_id", branchId)
      .gte("created_at", weekStartIso),
    supabase
      .from("incidents")
      .select("reported_by")
      .eq("organization_id", organizationId)
      .eq("branch_id", branchId)
      .gte("created_at", weekStartIso),
    supabase
      .from("out_of_stock_records")
      .select("reported_by")
      .eq("organization_id", organizationId)
      .eq("branch_id", branchId)
      .gte("created_at", weekStartIso),
    supabase
      .from("till_handovers")
      .select("submitted_by, variance")
      .eq("organization_id", organizationId)
      .eq("branch_id", branchId)
      .gte("created_at", weekStartIso),
  ]);

  const employeeRows = employees.data ?? [];

  return employeeRows.map((emp) => {
    const empTasks = (tasks.data ?? []).filter((t) => t.assigned_to === emp.id);
    const taskCompletionPct =
      empTasks.length > 0
        ? Math.round((empTasks.filter((t) => t.status === "completed").length / empTasks.length) * 100)
        : 0;

    const checklistCount = (checklistSubs.data ?? []).filter((c) => c.submitted_by === emp.id).length;
    const checklistCompletionPct = Math.min(100, checklistCount * 20);

    const reportsFiled =
      (incidents.data ?? []).filter((i) => i.reported_by === emp.id).length +
      (oos.data ?? []).filter((o) => o.reported_by === emp.id).length;

    const empHandovers = (tillHandovers.data ?? []).filter((h) => h.submitted_by === emp.id);
    const tillAccuracyPct =
      empHandovers.length > 0
        ? Math.round(
            (empHandovers.filter((h) => Math.abs(Number(h.variance ?? 0)) <= 5).length / empHandovers.length) * 100
          )
        : 0;

    const score = Math.round(
      taskCompletionPct * WEIGHTS.taskCompletion +
        checklistCompletionPct * WEIGHTS.checklistCompletion +
        Math.min(100, reportsFiled * 20) * WEIGHTS.reportsFiled +
        tillAccuracyPct * WEIGHTS.tillAccuracy
    );

    return {
      employeeId: emp.id,
      fullName: emp.full_name,
      score,
      breakdown: { taskCompletionPct, checklistCompletionPct, reportsFiled, tillAccuracyPct },
    };
  }).sort((a, b) => b.score - a.score);
}

export async function saveKpiSnapshot(organizationId: string, branchId: string, kpis: EmployeeKpi[]) {
  const supabase = await createClient();
  const periodLabel = currentWeekLabel();
  if (kpis.length === 0) return;

  await supabase.from("kpi_scores").upsert(
    kpis.map((k) => ({
      organization_id: organizationId,
      branch_id: branchId,
      employee_id: k.employeeId,
      period: "week" as const,
      period_label: periodLabel,
      score: k.score,
      breakdown: k.breakdown,
    })),
    { onConflict: "organization_id,branch_id,employee_id,period,period_label" }
  );
}
