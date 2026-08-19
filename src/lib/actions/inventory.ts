"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type InventoryResult = { error: string } | { error?: undefined };

export async function createInventoryCount(formData: FormData): Promise<InventoryResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const itemName = String(formData.get("itemName") ?? "").trim();
  const unit = String(formData.get("unit") ?? "pcs").trim() || "pcs";
  const countedQty = Number(formData.get("countedQty") ?? 0);
  const note = String(formData.get("note") ?? "").trim();

  if (!itemName || countedQty < 0) return { error: "Item name and quantity are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_counts").insert({
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    item_name: itemName,
    unit,
    counted_qty: countedQty,
    note: note || null,
    counted_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/inventory");
  return {};
}

export async function deleteInventoryCount(id: string): Promise<InventoryResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_counts")
    .delete()
    .eq("id", id)
    .eq("organization_id", user.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/inventory");
  return {};
}
