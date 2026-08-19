"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type HowToResult = { error: string } | { error?: undefined };

const MANAGER_ROLES = ["organization_owner", "operations_manager", "branch_manager", "supervisor"];

export async function createHowToGuide(formData: FormData): Promise<HowToResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };
  if (!MANAGER_ROLES.includes(user.org_role ?? "")) {
    return { error: "You don't have permission to add guides." };
  }

  const category = String(formData.get("category") ?? "cleaning");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title || !body) return { error: "Title and instructions are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("how_to_guides").insert({
    organization_id: user.organization_id,
    category,
    title,
    body,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/how-to");
  return {};
}

export async function deleteHowToGuide(id: string): Promise<HowToResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };
  if (!MANAGER_ROLES.includes(user.org_role ?? "")) {
    return { error: "You don't have permission to remove guides." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("how_to_guides")
    .delete()
    .eq("id", id)
    .eq("organization_id", user.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/how-to");
  return {};
}
