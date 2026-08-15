"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SubmitTripResult = { error: string } | { error?: undefined };

export async function submitBusinessTrip(formData: FormData): Promise<SubmitTripResult> {
  const user = await requireAuth();
  if (!user.organization_id || !user.branch_id) {
    return { error: "Your account isn't linked to a branch yet." };
  }

  const destination = String(formData.get("destination") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();
  const distanceKm = Number(formData.get("distanceKm") ?? 0);

  if (!destination || !purpose || distanceKm <= 0) {
    return { error: "Destination, purpose, and distance are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("business_trips").insert({
    organization_id: user.organization_id,
    branch_id: user.branch_id,
    submitted_by: user.id,
    destination,
    purpose,
    distance_km: distanceKm,
  });

  if (error) return { error: error.message };

  revalidatePath("/trips");
  return {};
}
