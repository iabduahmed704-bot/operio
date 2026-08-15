"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ResolveOosResult = { error: string } | { error?: undefined };

export async function resolveOutOfStock(id: string): Promise<ResolveOosResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("out_of_stock_records")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", user.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/out-of-stock");
  revalidatePath("/");
  return {};
}
