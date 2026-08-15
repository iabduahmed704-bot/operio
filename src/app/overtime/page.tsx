import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OvertimeForm } from "./OvertimeForm";
import { OvertimeList } from "./OvertimeList";

export default async function OvertimePage() {
  const t = await getTranslations("overtimePage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: records } = user.organization_id
    ? await supabase
        .from("overtime_records")
        .select("id, hours, reason, status, created_at")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const canReview = ["organization_owner", "operations_manager", "branch_manager"].includes(
    user.org_role ?? ""
  );

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <OvertimeForm />
        <OvertimeList initialItems={records ?? []} canReview={canReview} />
      </main>
      <MobileNav />
    </div>
  );
}
