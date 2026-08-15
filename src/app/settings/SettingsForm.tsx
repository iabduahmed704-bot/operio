"use client";

import { useState } from "react";
import { updateOrganizationSettings } from "@/lib/actions/settings";

export function SettingsForm({
  defaultLocale,
  currency,
  canEdit,
  labels,
}: {
  defaultLocale: string;
  currency: string;
  canEdit: boolean;
  labels: { locale: string; currency: string; save: string; saved: string; readonly: string };
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateOrganizationSettings(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {!canEdit && <p className="text-xs text-muted-foreground">{labels.readonly}</p>}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">{labels.locale}</span>
        <select
          name="defaultLocale"
          defaultValue={defaultLocale}
          disabled={!canEdit}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">{labels.currency}</span>
        <input
          name="currency"
          defaultValue={currency}
          disabled={!canEdit}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-500">{labels.saved}</p>}

      {canEdit && (
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {labels.save}
        </button>
      )}
    </form>
  );
}
