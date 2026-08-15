"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SubmitTillResult =
  | { error: string; variance?: undefined; requiresExplanation?: undefined }
  | { error?: undefined; variance: number; requiresExplanation: boolean };

const VARIANCE_THRESHOLD = 50;

export async function submitTillHandover(formData: FormData): Promise<SubmitTillResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const num = (key: string) => Number(formData.get(key) ?? 0) || 0;
  const openingCash = num("openingCash");
  const expectedCash = num("expectedCash");
  const actualCash = num("actualCash");
  const cardPayments = num("cardPayments");
  const cashPayments = num("cashPayments");
  const refunds = num("refunds");
  const notes = String(formData.get("notes") ?? "").trim();

  const variance = actualCash - expectedCash;
  const requiresExplanation = Math.abs(variance) > VARIANCE_THRESHOLD;

  if (requiresExplanation && !notes) {
    return {
      error: `Variance of ${variance.toFixed(2)} SAR exceeds the ${VARIANCE_THRESHOLD} SAR threshold — please explain in the notes.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("till_handovers").insert({
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    submitted_by: user.id,
    opening_cash: openingCash,
    expected_cash: expectedCash,
    actual_cash: actualCash,
    card_payments: cardPayments,
    cash_payments: cashPayments,
    refunds,
    notes: notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/till");
  return { variance, requiresExplanation };
}
