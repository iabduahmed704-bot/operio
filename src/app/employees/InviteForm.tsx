"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { generateInviteCode } from "@/lib/actions/invite";

const roleKeys = [
  { value: "operations_manager", key: "roleOperationsManager" },
  { value: "branch_manager", key: "roleBranchManager" },
  { value: "supervisor", key: "roleSupervisor" },
  { value: "employee", key: "roleEmployee" },
] as const;

export function InviteForm() {
  const t = useTranslations("employeesPage");
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
        {roleKeys.map((r) => (
          <option key={r.value} value={r.value}>
            {t(r.key)}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {code && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">{t("shareCode")}</p>
          <p className="mt-1 text-lg font-mono font-semibold tracking-widest">{code}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={generating}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {generating ? t("generating") : t("generate")}
      </button>
    </form>
  );
}
