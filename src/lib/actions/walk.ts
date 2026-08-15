"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type WalkType =
  | "opening"
  | "closing"
  | "food_safety"
  | "cleaning"
  | "equipment"
  | "store_readiness"
  | "custom";

export type StartWalkResult = { error: string } | { error?: undefined };

export async function startWalk(type: WalkType): Promise<StartWalkResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("walks")
    .insert({
      organization_id: user.organization_id,
      branch_id: user.branch_id,
      conducted_by: user.id,
      type,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not start walk." };

  redirect(`/walk/${data.id}`);
}

export type AddStopResult = { error: string } | { error?: undefined };

export async function addWalkStop(
  walkId: string,
  formData: FormData,
  photoUrl?: string
): Promise<AddStopResult> {
  await requireAuth();
  const issue = String(formData.get("issue") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const actionTaken = String(formData.get("actionTaken") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.from("walk_stops").insert({
    walk_id: walkId,
    issue: issue || null,
    note: note || null,
    action_taken: actionTaken || null,
    photo_url: photoUrl ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/walk/${walkId}`);
  return {};
}

export type CompleteWalkResult = { error: string } | { error?: undefined };

export async function completeWalk(walkId: string): Promise<CompleteWalkResult> {
  await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase
    .from("walks")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", walkId);

  if (error) return { error: error.message };

  revalidatePath(`/walk/${walkId}`);
  return {};
}
