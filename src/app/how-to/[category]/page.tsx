import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GuideForm } from "./GuideForm";
import { GuideList } from "./GuideList";

const VALID_CATEGORIES = ["cleaning", "maintenance", "preparation"];
const MANAGER_ROLES = ["organization_owner", "operations_manager", "branch_manager", "supervisor"];

export default async function HowToCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category)) notFound();

  const t = await getTranslations("howToPage");
  const user = await requireAuth();
  const supabase = await createClient();
  const canManage = MANAGER_ROLES.includes(user.org_role ?? "");

  const { data: guides } = user.organization_id
    ? await supabase
        .from("how_to_guides")
        .select("id, title, body")
        .eq("organization_id", user.organization_id)
        .eq("category", category)
        .order("sort_order", { ascending: true })
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/how-to" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{t(`category_${category}` as never)}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        {canManage && <GuideForm category={category} />}
        <GuideList initialItems={guides ?? []} canManage={canManage} />
      </main>
      <MobileNav />
    </div>
  );
}
