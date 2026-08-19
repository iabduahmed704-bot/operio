"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createReminder } from "@/lib/actions/reminders";

export function ReminderForm() {
  const t = useTranslations("remindersPage");
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await createReminder(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <input
        name="title"
        required
        placeholder={t("titlePlaceholder")}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          name="category"
          defaultValue="other"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        >
          <option value="watering">{t("categoryWatering")}</option>
          <option value="expiry">{t("categoryExpiry")}</option>
          <option value="cleaning">{t("categoryCleaning")}</option>
          <option value="chemical">{t("categoryChemical")}</option>
          <option value="other">{t("categoryOther")}</option>
        </select>
        <select
          name="recurrence"
          defaultValue="once"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        >
          <option value="once">{t("recurrenceOnce")}</option>
          <option value="daily">{t("recurrenceDaily")}</option>
          <option value="weekly">{t("recurrenceWeekly")}</option>
          <option value="monthly">{t("recurrenceMonthly")}</option>
        </select>
      </div>
      <input
        name="dueDate"
        type="datetime-local"
        required
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
