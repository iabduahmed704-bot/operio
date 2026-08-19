"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2, FileText } from "lucide-react";
import { deleteHowToGuide } from "@/lib/actions/howto";

type GuideRow = { id: string; title: string; body: string };

export function GuideList({ initialItems, canManage }: { initialItems: GuideRow[]; canManage: boolean }) {
  const t = useTranslations("howToPage");
  const [items, setItems] = useState(initialItems);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove(id: string) {
    startTransition(async () => {
      await deleteHowToGuide(id);
      setItems((current) => current.filter((item) => item.id !== id));
    });
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="rounded-2xl border border-border bg-surface p-4">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center gap-3 text-start"
            >
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <span className="flex-1 text-sm font-medium">{item.title}</span>
            </button>
            {open && (
              <div className="mt-3 space-y-3 border-t border-border pt-3">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.body}</p>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("delete")}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
