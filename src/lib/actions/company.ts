"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type UpdateLogoResult = { error: string } | { error?: undefined };

export async function updateOrganizationLogo(logoUrl: string): Promise<UpdateLogoResult> {
  const user = await requireAuth();
  if (!user.organization_id) return { error: "No organization linked to this account." };
  if (user.org_role !== "organization_owner") {
    return { error: "Only the organization owner can change the logo." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ logo_url: logoUrl })
    .eq("id", user.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/more");
  return {};
}
