import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const typeKey: Record<string, string> = {
  opening: "typeOpening",
  closing: "typeClosing",
  cleaning: "typeCleaning",
  food_safety: "typeFoodSafety",
  equipment: "typeEquipment",
  manager: "typeManager",
  weekly: "typeWeekly",
  monthly: "typeMonthly",
};

export default async function ChecklistsPage() {
  const t = await getTranslations("checklists");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: templates } = user.organization_id
    ? await supabase
        .from("checklist_templates")
        .select("id, title, type")
        .eq("organization_id", user.organization_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
    : { data: [] };

  const canCreate = ["organization_owner", "operations_manager", "branch_manager"].includes(
    user.org_role ?? ""
  );

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="flex items-center justify-between border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        {canCreate && (
          <Link
            href="/checklists/new"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5" />
          </Link>
        )}
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">
        {!templates || templates.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="space-y-2">
            {templates.map((template) => (
              <li key={template.id}>
                <Link
                  href={`/checklists/${template.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                >
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{template.title}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {typeKey[template.type] ? t(typeKey[template.type] as "typeOpening") : template.type}
                    </p>
                  </div>
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
