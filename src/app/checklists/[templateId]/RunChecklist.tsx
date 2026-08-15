"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { submitChecklist } from "@/lib/actions/checklists";

export function RunChecklist({
  templateId,
  items,
}: {
  templateId: string;
  items: { id: string; label: string; is_required: boolean }[];
}) {
  const t = useTranslations("checklists");
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredItems = items.filter((i) => i.is_required);
  const allRequiredChecked = requiredItems.every((i) => checked[i.id]);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitChecklist(templateId, checked);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h2 className="text-lg font-semibold">{t("completed")}</h2>
        <button
          type="button"
          onClick={() => router.push("/checklists")}
          className="mt-2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
        >
          {t("backToChecklists")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 px-4 py-6 md:px-8">
      {items.map((item) => (
        <label
          key={item.id}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
        >
          <input
            type="checkbox"
            checked={!!checked[item.id]}
            onChange={(e) => setChecked((c) => ({ ...c, [item.id]: e.target.checked }))}
            className="h-5 w-5 accent-[var(--primary)]"
          />
          <span className="text-sm">
            {item.label}
            {item.is_required && <span className="text-red-500"> *</span>}
          </span>
        </label>
      ))}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !allRequiredChecked}
        className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </div>
  );
}
