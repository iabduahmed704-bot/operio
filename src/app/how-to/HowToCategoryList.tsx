"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Sparkles, Wrench, ChefHat, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { key: "cleaning" as const, icon: Sparkles },
  { key: "maintenance" as const, icon: Wrench },
  { key: "preparation" as const, icon: ChefHat },
];

export function HowToCategoryList({ counts }: { counts: Record<string, number> }) {
  const t = useTranslations("howToPage");

  return (
    <div className="space-y-2">
      {CATEGORIES.map(({ key, icon: Icon }) => (
        <Link
          key={key}
          href={`/how-to/${key}`}
          className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors active:opacity-60"
        >
          <span className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{t(`category_${key}`)}</span>
          </span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            {t("guidesCount", { count: counts[key] ?? 0 })}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </span>
        </Link>
      ))}
    </div>
  );
}
