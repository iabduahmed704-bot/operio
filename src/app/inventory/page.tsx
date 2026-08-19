import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InventoryForm } from "./InventoryForm";
import { InventoryList } from "./InventoryList";

export default async function InventoryPage() {
  const t = await getTranslations("inventoryPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: items } = user.organization_id
    ? await supabase
        .from("inventory_counts")
        .select("id, item_name, unit, counted_qty, note, created_at")
        .eq("organization_id", user.organization_id)
        .eq("branch_id", user.branch_id ?? "")
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <InventoryForm />
        <InventoryList initialItems={items ?? []} />
      </main>
      <MobileNav />
    </div>
  );
}
