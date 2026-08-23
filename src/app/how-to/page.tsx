import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { HowToCategoryList } from "./HowToCategoryList";

export default async function HowToPage() {
  const t = await getTranslations("howToPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: guides } = user.organization_id
    ? await supabase.from("how_to_guides").select("category").eq("organization_id", user.organization_id)
    : { data: [] };

  const counts = (guides ?? []).reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>
      <main className="flex-1 px-4 py-6 md:px-8">
        <HowToCategoryList counts={counts} />
      </main>
      <MobileNav />
    </div>
  );
}
