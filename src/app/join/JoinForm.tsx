"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { redeemInviteCode } from "@/lib/actions/invite";

export function JoinForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await redeemInviteCode({ code, fullName, email, password });
    if (result?.error) {
      setSubmitting(false);
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 px-4 py-16">
      <h1 className="text-center text-xl font-semibold">Join your team</h1>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">Invite code</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm uppercase outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">Your name</span>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {submitting ? "Joining..." : "Join"}
      </button>
    </div>
  );
}
