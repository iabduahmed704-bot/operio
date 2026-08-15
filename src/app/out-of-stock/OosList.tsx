"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, PackageX } from "lucide-react";
import { resolveOutOfStock } from "@/lib/actions/oos";

type OosRow = { id: string; description: string; severity: string; created_at: string };

export function OosList({ initialItems }: { initialItems: OosRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function resolve(id: string) {
    startTransition(async () => {
      const result = await resolveOutOfStock(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((current) => current.filter((item) => item.id !== id));
    });
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nothing out of stock right now.</p>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <PackageX className="h-5 w-5 shrink-0 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">{item.description}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => resolve(item.id)}
            disabled={isPending}
            className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500 disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolve
          </button>
        </div>
      ))}
    </div>
  );
}
