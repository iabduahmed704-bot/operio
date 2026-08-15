import "server-only";
import { createClient } from "@/lib/supabase/server";

export type BranchKpi = {
  branchId: string;
  branchName: string;
  wasteCost: number;
  wasteCount: number;
  incidentsCount: number;
  taskCompliancePct: number;
};

export async function getBranchKpis(organizationId: string): Promise<BranchKpi[]> {
  const supabase = await createClient();

  const [branches, waste, incidents, tasksDone, tasksTotal] = await Promise.all([
    supabase.from("branches").select("id, name").eq("organization_id", organizationId),
    supabase.from("waste_records").select("branch_id, cost").eq("organization_id", organizationId),
    supabase.from("incidents").select("branch_id").eq("organization_id", organizationId),
    supabase
      .from("tasks")
      .select("branch_id")
      .eq("organization_id", organizationId)
      .eq("status", "completed"),
    supabase.from("tasks").select("branch_id").eq("organization_id", organizationId),
  ]);

  return (branches.data ?? []).map((branch) => {
    const branchWaste = (waste.data ?? []).filter((w) => w.branch_id === branch.id);
    const branchIncidents = (incidents.data ?? []).filter((i) => i.branch_id === branch.id);
    const branchTasksTotal = (tasksTotal.data ?? []).filter((t) => t.branch_id === branch.id).length;
    const branchTasksDone = (tasksDone.data ?? []).filter((t) => t.branch_id === branch.id).length;

    return {
      branchId: branch.id,
      branchName: branch.name,
      wasteCost: branchWaste.reduce((sum, w) => sum + Number(w.cost ?? 0), 0),
      wasteCount: branchWaste.length,
      incidentsCount: branchIncidents.length,
      taskCompliancePct:
        branchTasksTotal > 0 ? Math.round((branchTasksDone / branchTasksTotal) * 100) : 0,
    };
  });
}
