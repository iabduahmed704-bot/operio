"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/profile";

export function ProfileForm({
  fullName,
  email,
  phone,
  labels,
}: {
  fullName: string;
  email: string;
  phone: string | null;
  labels: { name: string; email: string; phone: string; save: string; saved: string };
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateProfile(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">{labels.name}</span>
        <input
          name="fullName"
          defaultValue={fullName}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">{labels.email}</span>
        <input
          value={email}
          disabled
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">{labels.phone}</span>
        <input
          name="phone"
          defaultValue={phone ?? ""}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-500">{labels.saved}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {labels.save}
      </button>
    </form>
  );
}
