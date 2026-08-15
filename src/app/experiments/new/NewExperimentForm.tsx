"use client";

import { useState } from "react";
import { createMenuExperiment } from "@/lib/actions/experiments";

export function NewExperimentForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await createMenuExperiment(formData);
    if (result?.error) {
      setSaving(false);
      setError(result.error);
    }
  }

  return (
    <form action={onSubmit} className="flex-1 space-y-4 px-4 py-6 md:px-8">
      <input
        name="productName"
        required
        placeholder="Product name"
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <textarea
        name="recipeNotes"
        rows={4}
        placeholder="Recipe notes"
        className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <input
        name="cost"
        type="number"
        step="0.01"
        placeholder="Cost per unit (SAR)"
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? "Creating..." : "Create experiment"}
      </button>
    </form>
  );
}
