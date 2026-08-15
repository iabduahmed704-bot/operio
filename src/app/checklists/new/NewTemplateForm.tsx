"use client";

import { useState } from "react";
import { createChecklistTemplate } from "@/lib/actions/checklists";

const types = [
  "opening",
  "closing",
  "cleaning",
  "food_safety",
  "equipment",
  "manager",
  "weekly",
  "monthly",
];

export function NewTemplateForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = await createChecklistTemplate(formData);
    if (result?.error) {
      setSaving(false);
      setError(result.error);
    }
  }

  return (
    <form action={onSubmit} className="flex-1 space-y-4 px-4 py-6 md:px-8">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">Title</span>
        <input
          name="title"
          required
          placeholder="Opening Checklist"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">Type</span>
        <select
          name="type"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">
          Items (one per line)
        </span>
        <textarea
          name="items"
          required
          rows={6}
          placeholder={"Check fridge temperature\nWipe down counters\nTurn on POS system"}
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? "Saving..." : "Create checklist"}
      </button>
    </form>
  );
}
