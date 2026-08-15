import "server-only";
import { createClient } from "@/lib/supabase/server";

export type TodayStats = {
  wasteTodaySar: number;
  taskCompliancePct: number;
  outOfStock: number;
  criticalIssues: number;
};

export async function getTodayStats(organizationId: string): Promise<TodayStats> {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const since = startOfDay.toISOString();

  const [waste, tasksDone, tasksTotal, oos, incidents] = await Promise.all([
    supabase
      .from("waste_records")
      .select("cost")
      .eq("organization_id", organizationId)
      .gte("created_at", since),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "completed"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("out_of_stock_records")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .is("resolved_at", null),
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("severity", "high")
      .gte("created_at", since),
  ]);

  const wasteTodaySar = (waste.data ?? []).reduce((sum, row) => sum + Number(row.cost ?? 0), 0);
  const total = tasksTotal.count ?? 0;
  const done = tasksDone.count ?? 0;
  const taskCompliancePct = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    wasteTodaySar,
    taskCompliancePct,
    outOfStock: oos.count ?? 0,
    criticalIssues: incidents.count ?? 0,
  };
}
