import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Search, ClipboardList, Wallet, Coffee } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Logo } from "@/components/ui/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTodayStats } from "@/lib/services/dashboard";
import { LinkPendingOverlay } from "@/components/ui/LinkPending";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tMore = await getTranslations("more");
  const tNav = await getTranslations("nav");
  const user = await requireAuth();
  const supabase = await createClient();

  const [stats, { data: org }] = await Promise.all([
    user.organization_id
      ? getTodayStats(user.organization_id)
      : Promise.resolve({ wasteTodaySar: 0, taskCompliancePct: 0, outOfStock: 0, criticalIssues: 0 }),
    user.organization_id
      ? supabase.from("organizations").select("logo_url").eq("id", user.organization_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const quickActions = [
    { href: "/till", label: tMore("till"), icon: Wallet },
    { href: "/checklists", label: tNav("checklists"), icon: ClipboardList },
    { href: "/breaks", label: tMore("breaks"), icon: Coffee },
  ];

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-4 backdrop-blur md:px-8">
        <div>
          {org?.logo_url ? (
            <Image src={org.logo_url} alt="" width={140} height={36} className="h-9 w-auto object-contain" unoptimized />
          ) : (
            <Logo height={36} />
          )}
          <p className="mt-1 text-sm text-muted-foreground">{t("today")}</p>
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

        <div className="mt-4 grid grid-cols-3 gap-3">
          {quickActions.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3 text-center transition-colors active:opacity-60"
            >
              <LinkPendingOverlay className="rounded-2xl" />
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
