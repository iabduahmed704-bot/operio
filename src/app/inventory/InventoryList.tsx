"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Package } from "lucide-react";
import { deleteInventoryCount } from "@/lib/actions/inventory";

type InventoryRow = {
  id: string;
  item_name: string;
  unit: string;
  counted_qty: number;
  note: string | null;
  created_at: string;
};

export function InventoryList({ initialItems }: { initialItems: InventoryRow[] }) {
  const t = useTranslations("inventoryPage");
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteInventoryCount(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((current) => current.filter((item) => item.id !== id));
    });
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <Package className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{item.item_name}</p>
            <p className="text-xs text-muted-foreground">
              {item.counted_qty} {item.unit} · {new Date(item.created_at).toLocaleString()}
            </p>
            {item.note && <p className="mt-1 text-sm">{item.note}</p>}
          </div>
          <button
            type="button"
            onClick={() => remove(item.id)}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
