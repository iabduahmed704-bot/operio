import { Star as StarIcon, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEmployeeKpisForBranch } from "@/lib/services/employee-kpi";
import { AwardStarForm } from "./AwardStarForm";

export default async function StarsPage() {
  const t = await getTranslations("starsPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const canAward = ["organization_owner", "operations_manager", "branch_manager", "supervisor"].includes(
    user.org_role ?? ""
  );

  const [{ data: stars }, { data: employees }, kpis] = await Promise.all([
    user.organization_id
      ? supabase
          .from("stars")
          .select("id, period, period_label, note, users!stars_employee_id_fkey(full_name)")
          .eq("organization_id", user.organization_id)
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),
    canAward && user.organization_id
      ? supabase.from("users").select("id, full_name").eq("organization_id", user.organization_id)
      : Promise.resolve({ data: [] }),
    canAward && user.organization_id && user.branch_id
      ? getEmployeeKpisForBranch(user.organization_id, user.branch_id)
      : Promise.resolve([]),
  ]);

  const topCandidate = kpis.find((k) => k.score > 0);

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        {canAward && topCandidate && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" />
              {t("kpiSuggestionTitle")}
            </p>
            <p className="mt-1 text-sm">
              {t("kpiSuggestionBody", { name: topCandidate.fullName, score: topCandidate.score })}
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <li>{t("kpiTasks")}: {topCandidate.breakdown.taskCompletionPct}%</li>
              <li>{t("kpiChecklists")}: {topCandidate.breakdown.checklistCompletionPct}%</li>
              <li>{t("kpiReports")}: {topCandidate.breakdown.reportsFiled}</li>
              <li>{t("kpiTill")}: {topCandidate.breakdown.tillAccuracyPct}%</li>
            </ul>
          </div>
        )}

        {canAward && <AwardStarForm employees={employees ?? []} />}

        <ul className="space-y-2">
          {(stars ?? []).map((s) => {
            const name = Array.isArray(s.users)
              ? (s.users[0] as { full_name: string } | undefined)?.full_name
              : (s.users as unknown as { full_name: string } | null)?.full_name;
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
                <StarIcon className="h-5 w-5 shrink-0 fill-amber-500 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">{name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.period === "week" ? t("starOfWeek") : t("starOfMonth")} — {s.period_label}
                  </p>
                  {s.note && <p className="mt-1 text-sm">{s.note}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <MobileNav />
    </div>
  );
}
