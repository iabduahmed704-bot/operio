"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type OnboardingInput = {
  ownerEmail: string;
  ownerPassword: string;
  ownerName: string;
  companyName: string;
  businessType: string;
  country: string;
  city: string;
  branchName: string;
  location: string;
  workingHours: string;
  preferredLocale: "en" | "ar";
};

export type OnboardingResult = { error: string } | { error?: undefined };

// Bootstraps a brand-new tenant: auth user + organization + branch +
// owner profile + trial subscription. Runs on the service-role client
// because at this point the user doesn't belong to an organization yet,
// so the normal RLS policies would reject every insert.
export async function completeOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  const admin = createAdminClient();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: input.ownerEmail,
    password: input.ownerPassword,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return { error: authError?.message ?? "Could not create account" };
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: input.companyName,
      business_type: input.businessType,
      country: input.country,
      city: input.city,
      default_locale: input.preferredLocale,
    })
    .select("id")
    .single();

  if (orgError || !org) {
    return { error: orgError?.message ?? "Could not create organization" };
  }

  const { data: branch, error: branchError } = await admin
    .from("branches")
    .insert({
      organization_id: org.id,
      name: input.branchName,
      location: input.location,
      working_hours: input.workingHours,
    })
    .select("id")
    .single();

  if (branchError || !branch) {
    return { error: branchError?.message ?? "Could not create branch" };
  }

  const { error: userError } = await admin.from("users").insert({
    auth_user_id: authUser.user.id,
    organization_id: org.id,
    branch_id: branch.id,
    org_role: "organization_owner",
    full_name: input.ownerName,
    email: input.ownerEmail,
    preferred_locale: input.preferredLocale,
  });

  if (userError) {
    return { error: userError.message };
  }

  const { data: plan } = await admin.from("plans").select("id").eq("key", "starter").single();

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + Number(process.env.TRIAL_DURATION_DAYS ?? 14));

  if (plan) {
    await admin.from("subscriptions").insert({
      organization_id: org.id,
      plan_id: plan.id,
      status: "trialing",
      trial_ends_at: trialEndsAt.toISOString(),
    });
  }

  // Sign the new owner in on the request's own client so the session
  // cookie is set for the browser that just completed onboarding.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: input.ownerEmail,
    password: input.ownerPassword,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  redirect("/");
}
