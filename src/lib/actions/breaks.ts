"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type BreakActionResult = { error: string } | { error?: undefined };

export async function startBreak(): Promise<BreakActionResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const supabase = await createClient();

  const { data: openBreak } = await supabase
    .from("break_records")
    .select("id")
    .eq("employee_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (openBreak) return { error: "You already have an open break." };

  const { error } = await supabase.from("break_records").insert({
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    employee_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/breaks");
  return {};
}

export async function endBreak(): Promise<BreakActionResult> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: openBreak } = await supabase
    .from("break_records")
    .select("id")
    .eq("employee_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (!openBreak) return { error: "No open break to end." };

  const { error } = await supabase
    .from("break_records")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", openBreak.id);

  if (error) return { error: error.message };

  revalidatePath("/breaks");
  return {};
}
