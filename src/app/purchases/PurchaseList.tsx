"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { approveManualPurchase } from "@/lib/actions/purchases";

type PurchaseRow = {
  id: string;
  item: string;
  amount: number;
  reason: string;
  approved: boolean;
  created_at: string;
};

export function PurchaseList({
  initialItems,
  canApprove,
}: {
  initialItems: PurchaseRow[];
  canApprove: boolean;
}) {
  const t = useTranslations("purchasesPage");
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  function approve(id: string) {
    startTransition(async () => {
      const result = await approveManualPurchase(id);
      if (!result.error) {
        setItems((current) => current.map((i) => (i.id === id ? { ...i, approved: true } : i)));
      }
    });
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{item.item}</p>
            <span className="text-sm font-semibold">{item.amount.toFixed(2)} SAR</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={
                item.approved
                  ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500"
                  : "rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500"
              }
            >
              {item.approved ? t("approved") : t("pendingApproval")}
            </span>
            {canApprove && !item.approved && (
              <button
                type="button"
                onClick={() => approve(item.id)}
                disabled={isPending}
                className="flex items-center gap-1 text-xs font-medium text-primary disabled:opacity-60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> {t("approve")}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
