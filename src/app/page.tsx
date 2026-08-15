import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Search } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { MobileNav } from "@/components/layout/MobileNav";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { requireAuth } from "@/lib/auth";
import { getTodayStats } from "@/lib/services/dashboard";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tApp = await getTranslations("app");
  const user = await requireAuth();

  const stats = user.organization_id
    ? await getTodayStats(user.organization_id)
    : { wasteTodaySar: 0, taskCompliancePct: 0, outOfStock: 0, criticalIssues: 0 };

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-4 backdrop-blur md:px-8">
        <div>
          <p className="text-lg font-semibold tracking-tight">{tApp("name")}</p>
          <p className="text-sm text-muted-foreground">{t("today")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground"
          >
            <Search className="h-4 w-4" />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <DashboardHero title={t("title")} />

      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            index={0}
            icon="coins"
            label={t("wasteToday")}
            value={`${stats.wasteTodaySar.toFixed(0)} SAR`}
            tone={stats.wasteTodaySar > 0 ? "critical" : "default"}
          />
          <StatCard
            index={1}
            icon="list-checks"
            label={t("tasksCompliance")}
            value={`${stats.taskCompliancePct}%`}
            tone={stats.taskCompliancePct >= 70 ? "positive" : "default"}
          />
          <StatCard
            index={2}
            icon="package-x"
            label={t("outOfStock")}
            value={String(stats.outOfStock)}
            href="/out-of-stock"
          />
          <StatCard
            index={3}
            icon="alert-octagon"
            label={t("criticalIssues")}
            value={String(stats.criticalIssues)}
            tone={stats.criticalIssues > 0 ? "critical" : "default"}
            href="/incidents"
          />
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
