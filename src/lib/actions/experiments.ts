"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ExperimentStatus = "testing" | "needs_changes" | "approved" | "rejected" | "launched";

export type CreateExperimentResult = { error: string } | { error?: undefined };

export async function createMenuExperiment(formData: FormData): Promise<CreateExperimentResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const productName = String(formData.get("productName") ?? "").trim();
  const recipeNotes = String(formData.get("recipeNotes") ?? "").trim();
  const cost = Number(formData.get("cost") ?? 0);

  if (!productName) return { error: "Product name is required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_experiments")
    .insert({
      organization_id: user.organization_id,
      branch_id: user.branch_id,
      created_by: user.id,
      product_name: productName,
      recipe_notes: recipeNotes || null,
      cost: cost || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create experiment." };

  revalidatePath("/experiments");
  redirect(`/experiments/${data.id}`);
}

export type UpdateExperimentResult = { error: string } | { error?: undefined };

export async function updateExperimentStats(
  id: string,
  updates: { preparedCount?: number; soldCount?: number; wasteCount?: number; status?: ExperimentStatus }
): Promise<UpdateExperimentResult> {
  await requireAuth();
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};
  if (updates.preparedCount !== undefined) payload.prepared_count = updates.preparedCount;
  if (updates.soldCount !== undefined) payload.sold_count = updates.soldCount;
  if (updates.wasteCount !== undefined) payload.waste_count = updates.wasteCount;
  if (updates.status !== undefined) payload.status = updates.status;

  const { error } = await supabase.from("menu_experiments").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/experiments/${id}`);
  return {};
}

export type AddFeedbackResult = { error: string } | { error?: undefined };

export async function addExperimentFeedback(id: string, formData: FormData): Promise<AddFeedbackResult> {
  const user = await requireAuth();
  const comment = String(formData.get("comment") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0) || null;

  if (!comment) return { error: "Comment is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("experiment_feedback").insert({
    experiment_id: id,
    submitted_by: user.id,
    comment,
    rating,
  });

  if (error) return { error: error.message };

  revalidatePath(`/experiments/${id}`);
  return {};
}
