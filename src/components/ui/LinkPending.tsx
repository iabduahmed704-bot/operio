"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Renders inside a <Link>'s children to show instant tap feedback while
// the next page's server render is in flight — without this, taps on
// data-fetching routes feel unresponsive for a beat before navigation.
export function LinkPendingOverlay({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/70 backdrop-blur-[1px]",
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
    </span>
  );
}
