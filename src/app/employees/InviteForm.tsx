"use client";

import { useState } from "react";
import { generateInviteCode } from "@/lib/actions/invite";

const roles = [
  { value: "operations_manager", label: "Operations Manager" },
  { value: "branch_manager", label: "Branch Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "employee", label: "Employee" },
];

export function InviteForm() {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function onSubmit(formData: FormData) {
    setGenerating(true);
    setError(null);
    setCode(null);
    const result = await generateInviteCode(formData);
    setGenerating(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setCode(result.code ?? null);
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <select
        name="role"
        defaultValue="employee"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      >
        {roles.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {code && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Share this code with the new team member:</p>
          <p className="mt-1 text-lg font-mono font-semibold tracking-widest">{code}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={generating}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {generating ? "Generating..." : "Generate invite code"}
      </button>
    </form>
  );
}
