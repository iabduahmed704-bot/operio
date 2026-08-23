import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { getBranchKpis } from "@/lib/services/kpis";

export default async function KpisPage() {
  const t = await getTranslations("kpis");
  const user = await requireAuth();

  const kpis = user.organization_id ? await getBranchKpis(user.organization_id) : [];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        {kpis.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{t("noBranches")}</p>
        ) : (
          kpis.map((kpi) => (
            <div key={kpi.branchId} className="rounded-2xl border border-border bg-surface p-4">
              <p className="mb-3 text-sm font-semibold">{kpi.branchName}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("wasteCost")}</p>
                  <p className="font-medium">{kpi.wasteCost.toFixed(0)} SAR</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("wasteCount")}</p>
                  <p className="font-medium">{kpi.wasteCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("incidents")}</p>
                  <p className="font-medium">{kpi.incidentsCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("taskCompliance")}</p>
                  <p className="font-medium">{kpi.taskCompliancePct}%</p>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
      <MobileNav />
    </div>
  );
}
