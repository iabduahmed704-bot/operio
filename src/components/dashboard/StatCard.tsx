"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coins, ListChecks, PackageX, AlertOctagon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  coins: Coins,
  "list-checks": ListChecks,
  "package-x": PackageX,
  "alert-octagon": AlertOctagon,
} satisfies Record<string, LucideIcon>;

export type StatIconKey = keyof typeof iconMap;

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
  index = 0,
  href,
}: {
  label: string;
  value: string;
  icon: StatIconKey;
  tone?: "default" | "critical" | "positive";
  index?: number;
  href?: string;
}) {
  const Icon = iconMap[icon];

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-lg"
    >
      <div
        className={cn(
          "absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30",
          tone === "critical" && "bg-red-500",
          tone === "positive" && "bg-emerald-500",
          tone === "default" && "bg-primary"
        )}
      />
      <div className="relative flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            tone === "critical" && "bg-red-500/10 text-red-500",
            tone === "positive" && "bg-emerald-500/10 text-emerald-500",
            tone === "default" && "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p
        className={cn(
          "relative mt-3 text-2xl font-semibold tracking-tight",
          tone === "critical" && "text-red-500",
          tone === "positive" && "text-emerald-500"
        )}
      >
        {value}
      </p>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
