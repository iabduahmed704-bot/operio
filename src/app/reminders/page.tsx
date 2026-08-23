import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReminderForm } from "./ReminderForm";
import { ReminderList } from "./ReminderList";

export default async function RemindersPage() {
  const t = await getTranslations("remindersPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: reminders } = user.organization_id
    ? await supabase
        .from("reminders")
        .select("id, title, category, recurrence, next_due_at")
        .eq("organization_id", user.organization_id)
        .eq("branch_id", user.branch_id ?? "")
        .order("next_due_at", { ascending: true })
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <ReminderForm />
        <ReminderList initialItems={reminders ?? []} />
      </main>
      <MobileNav />
    </div>
  );
}
