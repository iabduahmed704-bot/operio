"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { submitBusinessTrip } from "@/lib/actions/trips";

export function TripForm() {
  const t = useTranslations("tripsPage");
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await submitBusinessTrip(formData);
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
        name="destination"
        required
        placeholder={t("destinationPlaceholder")}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <input
        name="purpose"
        required
        placeholder={t("purposePlaceholder")}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <input
        name="distanceKm"
        type="number"
        step="0.1"
        required
        placeholder={t("distancePlaceholder")}
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
