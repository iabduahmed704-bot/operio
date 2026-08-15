"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, ListChecks, Trash2, AlertOctagon, User, Building2 } from "lucide-react";
import { runSearch } from "@/lib/actions/search";
import type { SearchResult } from "@/lib/services/search";

const iconByKind: Record<SearchResult["kind"], typeof Search> = {
  task: ListChecks,
  waste: Trash2,
  incident: AlertOctagon,
  employee: User,
  branch: Building2,
};

export function SearchClient() {
  const t = useTranslations("searchPage");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    setQuery(value);
    startTransition(async () => {
      const data = await runSearch(value);
      setResults(data);
    });
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full bg-transparent text-sm outline-none"
          autoFocus
        />
      </div>

      {isPending && <p className="mt-4 text-center text-sm text-muted-foreground">{t("searching")}</p>}

      {!isPending && query.trim() && results.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">{t("noResults")}</p>
      )}

      <ul className="mt-4 space-y-2">
        {results.map((r) => {
          const Icon = iconByKind[r.kind];
          return (
            <li key={`${r.kind}-${r.id}`}>
              <Link
                href={r.href}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  {r.subtitle && <p className="text-xs text-muted-foreground">{r.subtitle}</p>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
