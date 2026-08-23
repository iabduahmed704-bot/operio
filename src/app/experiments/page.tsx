import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus, FlaskConical } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const statusColor: Record<string, string> = {
  testing: "bg-blue-500/10 text-blue-500",
  needs_changes: "bg-amber-500/10 text-amber-500",
  approved: "bg-emerald-500/10 text-emerald-500",
  rejected: "bg-red-500/10 text-red-500",
  launched: "bg-primary/10 text-primary",
};

const statusKey: Record<string, string> = {
  testing: "statusTesting",
  needs_changes: "statusNeedsChanges",
  approved: "statusApproved",
  rejected: "statusRejected",
  launched: "statusLaunched",
};

export default async function ExperimentsPage() {
  const t = await getTranslations("experimentsPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: experiments } = user.organization_id
    ? await supabase
        .from("menu_experiments")
        .select("id, product_name, status, prepared_count, sold_count, waste_count")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <Link
          href="/experiments/new"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">
        {!experiments || experiments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="space-y-2">
            {experiments.map((exp) => (
              <li key={exp.id}>
                <Link
                  href={`/experiments/${exp.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                >
                  <FlaskConical className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{exp.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("prepared")} {exp.prepared_count} · {t("sold")} {exp.sold_count} · {t("waste")}{" "}
                      {exp.waste_count}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[exp.status]}`}>
                    {t(statusKey[exp.status] as "statusTesting")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
