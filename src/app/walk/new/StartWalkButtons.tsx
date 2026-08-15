"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { startWalk, type WalkType } from "@/lib/actions/walk";

const types: { value: WalkType; key: string }[] = [
  { value: "opening", key: "typeOpening" },
  { value: "closing", key: "typeClosing" },
  { value: "food_safety", key: "typeFoodSafety" },
  { value: "cleaning", key: "typeCleaning" },
  { value: "equipment", key: "typeEquipment" },
  { value: "store_readiness", key: "typeStoreReadiness" },
  { value: "custom", key: "typeCustom" },
];

export function StartWalkButtons() {
  const t = useTranslations("walkPage");
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
        {types.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onSelect(type.value)}
            disabled={isPending}
            className="rounded-2xl border border-border bg-surface p-5 text-sm font-medium disabled:opacity-60"
          >
            {t(type.key as "typeOpening")}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
