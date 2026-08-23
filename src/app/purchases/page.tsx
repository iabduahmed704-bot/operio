import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PurchaseForm } from "./PurchaseForm";
import { PurchaseList } from "./PurchaseList";

export default async function PurchasesPage() {
  const t = await getTranslations("purchasesPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: purchases } = user.organization_id
    ? await supabase
        .from("manual_purchases")
        .select("id, item, amount, reason, approved, created_at")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const canApprove = ["organization_owner", "operations_manager", "branch_manager"].includes(
    user.org_role ?? ""
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <PurchaseForm />
        <PurchaseList initialItems={purchases ?? []} canApprove={canApprove} />
      </main>
      <MobileNav />
    </div>
  );
}
