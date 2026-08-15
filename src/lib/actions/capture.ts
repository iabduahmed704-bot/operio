"use server";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CaptureType =
  | "waste"
  | "damage"
  | "oos"
  | "issue"
  | "mistake"
  | "equipment"
  | "photo-note"
  | "other";

export type CaptureInput = {
  type: CaptureType;
  description: string;
  severity: "low" | "medium" | "high";
  photoUrl?: string;
};

export type CaptureResult = { error: string } | { error?: undefined };

const tableByType: Record<CaptureType, "waste_records" | "damage_records" | "out_of_stock_records" | "incidents"> = {
  waste: "waste_records",
  damage: "damage_records",
  oos: "out_of_stock_records",
  issue: "incidents",
  mistake: "incidents",
  equipment: "incidents",
  "photo-note": "incidents",
  other: "incidents",
};

export async function submitCaptureReport(input: CaptureInput): Promise<CaptureResult> {
  const user = await requireAuth();

  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }
  if (!input.description.trim()) {
    return { error: "Description is required." };
  }

  const supabase = await createClient();
  const table = tableByType[input.type];

  const row: Record<string, unknown> = {
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    reported_by: user.id,
    description: input.description.trim(),
    severity: input.severity,
    photo_url: input.photoUrl ?? null,
  };
  if (table === "incidents") row.category = input.type;

  const { error } = await supabase.from(table).insert(row);

  if (error) return { error: error.message };
  return {};
}
