"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CreateBranchResult = { error: string } | { error?: undefined };

export async function createBranch(formData: FormData): Promise<CreateBranchResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };
  if (!["organization_owner", "operations_manager"].includes(user.org_role ?? "")) {
    return { error: "You don't have permission to add branches." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const workingHours = String(formData.get("workingHours") ?? "").trim();

  if (!name) return { error: "Branch name is required." };

  const supabase = await createClient();

  const [{ count: branchCount }, { data: subscription }] = await Promise.all([
    supabase
      .from("branches")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", user.organization_id),
    supabase
      .from("subscriptions")
      .select("plans(max_branches)")
      .eq("organization_id", user.organization_id)
      .maybeSingle(),
  ]);

  const rawPlan = subscription?.plans as unknown;
  const maxBranches = Array.isArray(rawPlan)
    ? (rawPlan[0] as { max_branches: number | null } | undefined)?.max_branches
    : (rawPlan as { max_branches: number | null } | null)?.max_branches;

  if (maxBranches != null && (branchCount ?? 0) >= maxBranches) {
    return { error: `Your plan allows up to ${maxBranches} branch(es). Upgrade to add more.` };
  }

  const { error } = await supabase.from("branches").insert({
    organization_id: user.organization_id,
    name,
    location: location || null,
    working_hours: workingHours || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/branches");
  revalidatePath("/subscription");
  return {};
}
