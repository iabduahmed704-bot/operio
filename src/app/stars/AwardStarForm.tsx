"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { awardStar } from "@/lib/actions/stars";

export function AwardStarForm({ employees }: { employees: { id: string; full_name: string }[] }) {
  const t = useTranslations("starsPage");
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await awardStar(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <select
        name="employeeId"
        required
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      >
        <option value="">{t("selectEmployee")}</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.full_name}
          </option>
        ))}
      </select>
      <select
        name="period"
        defaultValue="week"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      >
        <option value="week">{t("starOfWeek")}</option>
        <option value="month">{t("starOfMonth")}</option>
      </select>
      <textarea
        name="note"
        rows={2}
        placeholder={t("whyPlaceholder")}
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? t("saving") : t("award")}
      </button>
    </form>
  );
}
