import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const categoryKey: Record<string, string> = {
  issue: "categoryIssue",
  mistake: "categoryMistake",
  equipment: "categoryEquipment",
  "photo-note": "categoryPhotoNote",
  other: "categoryOther",
};

export default async function IncidentsPage() {
  const t = await getTranslations("incidentsPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: incidents } = user.organization_id
    ? await supabase
        .from("incidents")
        .select("id, category, description, severity, created_at")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const rows = incidents ?? [];

  const byCategory = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.category] = (acc[row.category] ?? 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  const label = (category: string) =>
    categoryKey[category] ? t(categoryKey[category] as "categoryIssue") : category;

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        {topCategories.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-3 text-sm font-semibold">{t("recurringProblems")}</p>
            <div className="space-y-2">
              {topCategories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label(category)}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {label(row.category)}
                  </span>
                  <span
                    className={
                      row.severity === "high"
                        ? "rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500"
                        : row.severity === "medium"
                          ? "rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500"
                          : "rounded-full bg-muted-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {row.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm">{row.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
