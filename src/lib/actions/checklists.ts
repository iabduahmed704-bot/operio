"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ChecklistType =
  | "opening"
  | "closing"
  | "cleaning"
  | "food_safety"
  | "equipment"
  | "manager"
  | "weekly"
  | "monthly";

export type CreateTemplateResult = { error: string } | { error?: undefined };

export async function createChecklistTemplate(formData: FormData): Promise<CreateTemplateResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };
  if (!["organization_owner", "operations_manager", "branch_manager"].includes(user.org_role ?? "")) {
    return { error: "You don't have permission to create checklists." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "opening") as ChecklistType;
  const itemsRaw = String(formData.get("items") ?? "");
  const items = itemsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!title) return { error: "Title is required." };
  if (items.length === 0) return { error: "Add at least one checklist item." };

  const supabase = await createClient();

  const { data: template, error: templateError } = await supabase
    .from("checklist_templates")
    .insert({
      organization_id: user.organization_id,
      branch_id: user.branch_id,
      title,
      type,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (templateError || !template) return { error: templateError?.message ?? "Could not create checklist." };

  const { error: itemsError } = await supabase.from("checklist_items").insert(
    items.map((label, index) => ({
      template_id: template.id,
      label,
      order_index: index,
    }))
  );

  if (itemsError) return { error: itemsError.message };

  revalidatePath("/checklists");
  redirect("/checklists");
}

export type SubmitChecklistResult = { error: string } | { error?: undefined };

export async function submitChecklist(
  templateId: string,
  responses: Record<string, boolean>
): Promise<SubmitChecklistResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_submissions").insert({
    template_id: templateId,
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    submitted_by: user.id,
    responses,
  });

  if (error) return { error: error.message };

  revalidatePath("/checklists");
  return {};
}
