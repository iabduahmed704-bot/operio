"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(next: "en" | "ar") {
    if (next === locale) return;
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    startTransition(() => router.refresh());
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border p-1 text-sm">
      <button
        type="button"
        onClick={() => setLocale("ar")}
        disabled={isPending}
        className={`rounded-full px-3 py-1 transition-colors ${
          locale === "ar" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        disabled={isPending}
        className={`rounded-full px-3 py-1 transition-colors ${
          locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
