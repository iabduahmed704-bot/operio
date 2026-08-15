import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RunChecklist } from "./RunChecklist";

export default async function ChecklistRunPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  await requireAuth();
  const supabase = await createClient();

  const [{ data: template }, { data: items }] = await Promise.all([
    supabase.from("checklist_templates").select("id, title").eq("id", templateId).maybeSingle(),
    supabase
      .from("checklist_items")
      .select("id, label, is_required")
      .eq("template_id", templateId)
      .order("order_index", { ascending: true }),
  ]);

  if (!template) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/checklists" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{template.title}</h1>
      </header>
      <RunChecklist templateId={templateId} items={items ?? []} />
    </div>
  );
}
