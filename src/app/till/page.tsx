import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TillForm } from "./TillForm";

export default async function TillPage() {
  const t = await getTranslations("tillPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: handovers } = user.organization_id
    ? await supabase
        .from("till_handovers")
        .select("id, actual_cash, expected_cash, variance, created_at")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <TillForm />

        <ul className="space-y-2">
          {(handovers ?? []).map((h) => (
            <li key={h.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
              <div>
                <p className="text-sm font-medium">{t("countedLabel", { amount: h.actual_cash.toFixed(2) })}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={
                  Math.abs(h.variance) > 50
                    ? "rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500"
                    : "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500"
                }
              >
                {t("varianceLabel", { sign: h.variance >= 0 ? "+" : "", variance: h.variance.toFixed(2) })}
              </span>
            </li>
          ))}
        </ul>
      </main>
      <MobileNav />
    </div>
  );
}
