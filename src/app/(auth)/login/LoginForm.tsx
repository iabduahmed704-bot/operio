"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export function LoginForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-xl font-semibold">{t("login")}</h1>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-foreground">{t("email")}</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-foreground">{t("password")}</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? tCommon("loading") : t("login")}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/onboarding" className="text-primary">
            {t("signup")}
          </Link>
        </p>
      </form>
    </div>
  );
}
