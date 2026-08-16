"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { submitShiftHandover } from "@/lib/actions/shifts";

const shiftKeys = [
  { value: "opening", key: "typeOpening" },
  { value: "morning", key: "typeMorning" },
  { value: "afternoon", key: "typeAfternoon" },
  { value: "closing", key: "typeClosing" },
] as const;

export function HandoverForm() {
  const t = useTranslations("shiftsPage");
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await submitShiftHandover(formData);
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
        name="shiftLabel"
        defaultValue="opening"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      >
        {shiftKeys.map((s) => (
          <option key={s.value} value={s.value}>
            {t(s.key)}
          </option>
        ))}
      </select>
      <textarea
        name="notes"
        required
        rows={4}
        placeholder={t("notesPlaceholder")}
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
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
