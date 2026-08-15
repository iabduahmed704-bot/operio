"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { submitManualPurchase } from "@/lib/actions/purchases";

export function PurchaseForm() {
  const t = useTranslations("purchasesPage");
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await submitManualPurchase(formData);
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
        name="item"
        required
        placeholder={t("itemPlaceholder")}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <input
        name="supplier"
        placeholder={t("supplierPlaceholder")}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <input
        name="amount"
        type="number"
        step="0.01"
        required
        placeholder={t("amountPlaceholder")}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <textarea
        name="reason"
        required
        rows={2}
        placeholder={t("reasonPlaceholder")}
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
