"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createHowToGuide } from "@/lib/actions/howto";

export function GuideForm({ category }: { category: string }) {
  const t = useTranslations("howToPage");
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await createHowToGuide(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <input type="hidden" name="category" value={category} />
      <input
        name="title"
        required
        placeholder={t("guideTitlePlaceholder")}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <textarea
        name="body"
        rows={5}
        required
        placeholder={t("guideBodyPlaceholder")}
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? t("submitting") : t("addGuide")}
      </button>
    </form>
  );
}
