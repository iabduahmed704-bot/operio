"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type UpdateProfileResult = { error: string } | { error?: undefined };

export async function updateProfile(formData: FormData): Promise<UpdateProfileResult> {
  const user = await requireAuth();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/more");
  return {};
}
