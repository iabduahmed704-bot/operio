"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { reviewOvertime } from "@/lib/actions/overtime";

type OvertimeRow = { id: string; hours: number; reason: string; status: string; created_at: string };

export function OvertimeList({
  initialItems,
  canReview,
}: {
  initialItems: OvertimeRow[];
  canReview: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  function review(id: string, approve: boolean) {
    startTransition(async () => {
      const result = await reviewOvertime(id, approve);
      if (!result.error) {
        setItems((current) =>
          current.map((i) => (i.id === id ? { ...i, status: approve ? "approved" : "rejected" } : i))
        );
      }
    });
  }

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No overtime submitted yet.</p>;
  }

  const statusColor: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500",
    approved: "bg-emerald-500/10 text-emerald-500",
    rejected: "bg-red-500/10 text-red-500",
  };

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{item.hours} hours</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[item.status]}`}>
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
          {canReview && item.status === "pending" && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => review(item.id, true)}
                disabled={isPending}
                className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500 disabled:opacity-60"
              >
                <Check className="h-3 w-3" /> Approve
              </button>
              <button
                type="button"
                onClick={() => review(item.id, false)}
                disabled={isPending}
                className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500 disabled:opacity-60"
              >
                <X className="h-3 w-3" /> Reject
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
