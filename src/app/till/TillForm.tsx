"use client";

import { useRef, useState } from "react";
import { submitTillHandover } from "@/lib/actions/till";

const fields = [
  { name: "openingCash", label: "Opening cash" },
  { name: "expectedCash", label: "Expected cash" },
  { name: "actualCash", label: "Actual cash counted" },
  { name: "cardPayments", label: "Card payments" },
  { name: "cashPayments", label: "Cash payments" },
  { name: "refunds", label: "Refunds" },
];

export function TillForm() {
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
    setSuccess(`Saved. Variance: ${result.variance!.toFixed(2)} SAR.`);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</span>
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
        placeholder="Notes (required if variance is large)"
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-500">{success}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? "Saving..." : "Submit till handover"}
      </button>
    </form>
  );
}
