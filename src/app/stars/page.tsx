import { Star as StarIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AwardStarForm } from "./AwardStarForm";

export default async function StarsPage() {
  const t = await getTranslations("starsPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const canAward = ["organization_owner", "operations_manager", "branch_manager", "supervisor"].includes(
    user.org_role ?? ""
  );

  const [{ data: stars }, { data: employees }] = await Promise.all([
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
  ]);

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
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
