import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OosList } from "./OosList";

export default async function OutOfStockPage() {
  const t = await getTranslations("dashboard");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: items } = user.organization_id
    ? await supabase
        .from("out_of_stock_records")
        .select("id, description, severity, created_at")
        .eq("organization_id", user.organization_id)
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("outOfStock")}</h1>
      </header>
      <main className="flex-1 px-4 py-6 md:px-8">
        <OosList initialItems={items ?? []} />
      </main>
      <MobileNav />
    </div>
  );
}
