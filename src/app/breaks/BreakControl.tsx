"use client";

import { useState, useTransition } from "react";
import { Coffee } from "lucide-react";
import { startBreak, endBreak } from "@/lib/actions/breaks";

export function BreakControl({ isOnBreak }: { isOnBreak: boolean }) {
  const [onBreak, setOnBreak] = useState(isOnBreak);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    startTransition(async () => {
      setError(null);
      const result = onBreak ? await endBreak() : await startBreak();
      if (result.error) {
        setError(result.error);
        return;
      }
      setOnBreak(!onBreak);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 text-center">
      <Coffee className={`mx-auto h-10 w-10 ${onBreak ? "text-amber-500" : "text-muted-foreground"}`} />
      <p className="mt-2 text-sm text-muted-foreground">
        {onBreak ? "You are currently on break" : "You are not on break"}
      </p>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={
          onBreak
            ? "mt-4 w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            : "mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        }
      >
        {onBreak ? "End break" : "Start break"}
      </button>
    </div>
  );
}
