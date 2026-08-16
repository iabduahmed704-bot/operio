import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SubscriptionPage() {
  const t = await getTranslations("subscription");
  const user = await requireAuth();
  const supabase = await createClient();

  const [{ data: subscription }, branchCount, userCount] = user.organization_id
    ? await Promise.all([
        supabase
          .from("subscriptions")
          .select("status, trial_ends_at, plans(name, max_branches, max_users)")
          .eq("organization_id", user.organization_id)
          .maybeSingle(),
        supabase
          .from("branches")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", user.organization_id),
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", user.organization_id),
      ])
    : [{ data: null }, { count: 0 }, { count: 0 }];

  type PlanRow = { name: string; max_branches: number | null; max_users: number | null };
  const rawPlan = subscription?.plans as unknown;
  const plan: PlanRow | null = Array.isArray(rawPlan)
    ? ((rawPlan[0] as PlanRow) ?? null)
    : ((rawPlan as PlanRow) ?? null);
  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/more" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        {!subscription ? (
          <p className="text-sm text-muted-foreground">{t("noSubscription")}</p>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm text-muted-foreground">{t("currentPlan")}</p>
              <p className="mt-1 text-xl font-semibold">{plan?.name ?? "—"}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("status")}: {subscription.status}
              </p>
              {subscription.status === "trialing" && daysLeft !== null && (
                <p className="mt-1 text-sm text-amber-500">
                  {daysLeft > 0 ? t("trialEndsIn", { days: daysLeft }) : t("trialExpired")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-sm text-muted-foreground">{t("branches")}</p>
                <p className="mt-1 text-lg font-semibold">
                  {branchCount.count ?? 0} / {plan?.max_branches ?? t("unlimited")}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-sm text-muted-foreground">{t("users")}</p>
                <p className="mt-1 text-lg font-semibold">
                  {userCount.count ?? 0} / {plan?.max_users ?? t("unlimited")}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
