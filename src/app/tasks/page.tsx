import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function TasksPage() {
  const t = await getTranslations("tasks");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: tasks } = user.organization_id
    ? await supabase
        .from("tasks")
        .select("id, title, status, due_date")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>
      <main className="flex-1 px-4 md:px-8">
        {!tasks || tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between py-4 text-sm">
                <span>{task.title}</span>
                <span
                  className={
                    task.status === "completed"
                      ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500"
                      : "rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500"
                  }
                >
                  {task.status === "completed" ? t("completed") : t("pending")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
