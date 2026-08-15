"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createChecklistTemplate } from "@/lib/actions/checklists";

const typeKeys = [
  { value: "opening", key: "typeOpening" },
  { value: "closing", key: "typeClosing" },
  { value: "cleaning", key: "typeCleaning" },
  { value: "food_safety", key: "typeFoodSafety" },
  { value: "equipment", key: "typeEquipment" },
  { value: "manager", key: "typeManager" },
  { value: "weekly", key: "typeWeekly" },
  { value: "monthly", key: "typeMonthly" },
] as const;

export function NewTemplateForm() {
  const t = useTranslations("checklists");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await createChecklistTemplate(formData);
    if (result?.error) {
      setSaving(false);
      setError(result.error);
    }
  }

  return (
    <form action={onSubmit} className="flex-1 space-y-4 px-4 py-6 md:px-8">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">{t("titleLabel")}</span>
        <input
          name="title"
          required
          placeholder={t("titlePlaceholder")}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">{t("typeLabel")}</span>
        <select
          name="type"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        >
          {typeKeys.map((type) => (
            <option key={type.value} value={type.value}>
              {t(type.key)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">{t("itemsLabel")}</span>
        <textarea
          name="items"
          required
          rows={6}
          placeholder={t("itemsPlaceholder")}
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? t("creating") : t("create")}
      </button>
    </form>
  );
}
