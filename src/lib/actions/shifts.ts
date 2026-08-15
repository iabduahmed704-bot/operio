"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SubmitHandoverResult = { error: string } | { error?: undefined };

export async function submitShiftHandover(formData: FormData): Promise<SubmitHandoverResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const shiftLabel = String(formData.get("shiftLabel") ?? "opening");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!notes) return { error: "Handover notes are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("shift_handovers").insert({
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    submitted_by: user.id,
    shift_label: shiftLabel,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath("/shifts");
  return {};
}
