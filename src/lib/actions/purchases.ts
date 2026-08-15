"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SubmitPurchaseResult = { error: string } | { error?: undefined };

export async function submitManualPurchase(formData: FormData): Promise<SubmitPurchaseResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const item = String(formData.get("item") ?? "").trim();
  const supplier = String(formData.get("supplier") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();

  if (!item || !reason || amount <= 0) {
    return { error: "Item, amount, and reason are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("manual_purchases").insert({
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    submitted_by: user.id,
    item,
    supplier: supplier || null,
    amount,
    reason,
  });

  if (error) return { error: error.message };

  revalidatePath("/purchases");
  return {};
}

export type ApprovePurchaseResult = { error: string } | { error?: undefined };

export async function approveManualPurchase(id: string): Promise<ApprovePurchaseResult> {
  const user = await requireAuth();
  if (!["organization_owner", "operations_manager", "branch_manager"].includes(user.org_role ?? "")) {
    return { error: "You don't have permission to approve purchases." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("manual_purchases")
    .update({ approved: true, approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/purchases");
  return {};
}
