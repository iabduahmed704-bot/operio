"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { submitTillHandover } from "@/lib/actions/till";

const fieldKeys = [
  { name: "openingCash", key: "openingCash" },
  { name: "expectedCash", key: "expectedCash" },
  { name: "actualCash", key: "actualCash" },
  { name: "cardPayments", key: "cardPayments" },
  { name: "cashPayments", key: "cashPayments" },
  { name: "refunds", key: "refunds" },
] as const;

export function TillForm() {
  const t = useTranslations("tillPage");
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const result = await submitTillHandover(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(t("saved", { variance: result.variance!.toFixed(2) }));
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <div className="grid grid-cols-2 gap-3">
        {fieldKeys.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">{t(f.key)}</span>
            <input
              name={f.name}
              type="number"
              step="0.01"
              defaultValue={0}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
      </div>
      <textarea
        name="notes"
        rows={2}
        placeholder={t("notesPlaceholder")}
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-500">{success}</p>}
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
