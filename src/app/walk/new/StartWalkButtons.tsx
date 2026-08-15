"use client";

import { useState, useTransition } from "react";
import { startWalk, type WalkType } from "@/lib/actions/walk";

const types: { value: WalkType; label: string }[] = [
  { value: "opening", label: "Opening" },
  { value: "closing", label: "Closing" },
  { value: "food_safety", label: "Food Safety" },
  { value: "cleaning", label: "Cleaning" },
  { value: "equipment", label: "Equipment" },
  { value: "store_readiness", label: "Store Readiness" },
  { value: "custom", label: "Custom" },
];

export function StartWalkButtons() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSelect(type: WalkType) {
    startTransition(async () => {
      const result = await startWalk(type);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex-1 px-4 py-6 md:px-8">
      <div className="grid grid-cols-2 gap-3">
        {types.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onSelect(t.value)}
            disabled={isPending}
            className="rounded-2xl border border-border bg-surface p-5 text-sm font-medium disabled:opacity-60"
          >
            {t.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
