import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BranchForm } from "./BranchForm";

export default async function BranchesPage() {
  const tNav = await getTranslations("nav");
  const tOnboarding = await getTranslations("onboarding");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: branches } = user.organization_id
    ? await supabase
        .from("branches")
        .select("id, name, location, working_hours")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const canManage = ["organization_owner", "operations_manager"].includes(user.org_role ?? "");

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/more" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{tNav("branches")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <ul className="space-y-2">
          {(branches ?? []).map((branch) => (
            <li key={branch.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{branch.name}</p>
                {branch.location && <p className="text-xs text-muted-foreground">{branch.location}</p>}
                {branch.working_hours && (
                  <p className="text-xs text-muted-foreground">{branch.working_hours}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {canManage && (
          <BranchForm
            labels={{
              branchName: tOnboarding("branchName"),
              location: tOnboarding("location"),
              workingHours: tOnboarding("workingHours"),
              add: tOnboarding("createBranch"),
            }}
          />
        )}
      </main>
      <MobileNav />
    </div>
  );
}
