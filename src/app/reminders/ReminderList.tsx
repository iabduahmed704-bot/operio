"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Bell } from "lucide-react";
import { completeReminder } from "@/lib/actions/reminders";

type ReminderRow = {
  id: string;
  title: string;
  category: string;
  recurrence: string;
  next_due_at: string;
};

export function ReminderList({ initialItems }: { initialItems: ReminderRow[] }) {
  const t = useTranslations("remindersPage");
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function complete(id: string, recurrence: string) {
    startTransition(async () => {
      const result = await completeReminder(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (recurrence === "once") {
        setItems((current) => current.filter((item) => item.id !== id));
      }
    });
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>;
  }

  const now = Date.now();

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {items.map((item) => {
        const overdue = new Date(item.next_due_at).getTime() < now;
        return (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <Bell className={overdue ? "h-5 w-5 shrink-0 text-red-500" : "h-5 w-5 shrink-0 text-amber-500"} />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {t(`category${item.category.charAt(0).toUpperCase()}${item.category.slice(1)}` as never)} ·{" "}
                {new Date(item.next_due_at).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => complete(item.id, item.recurrence)}
              disabled={isPending}
              className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("markDone")}
            </button>
          </div>
        );
      })}
    </div>
  );
}
