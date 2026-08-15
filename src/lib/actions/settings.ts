"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type UpdateOrgSettingsResult = { error: string } | { error?: undefined };

export async function updateOrganizationSettings(formData: FormData): Promise<UpdateOrgSettingsResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };
  if (user.org_role !== "organization_owner") {
    return { error: "Only the organization owner can change these settings." };
  }

  const defaultLocale = String(formData.get("defaultLocale") ?? "en");
  const currency = String(formData.get("currency") ?? "SAR");

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ default_locale: defaultLocale, currency })
    .eq("id", user.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return {};
}
