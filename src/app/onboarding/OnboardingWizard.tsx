"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding";

type FormState = {
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  companyName: string;
  businessType: string;
  country: string;
  city: string;
  branchName: string;
  location: string;
  workingHours: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  template: string;
};

const initialState: FormState = {
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
  companyName: "",
  businessType: "restaurant",
  country: "",
  city: "",
  branchName: "",
  location: "",
  workingHours: "",
  managerName: "",
  managerEmail: "",
  managerPhone: "",
  template: "restaurant",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function OnboardingWizard() {
  const t = useTranslations("onboarding");

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 6;
  const set = (key: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const templates = [
    { key: "restaurant", labelKey: "templateRestaurant" },
    { key: "cafe", labelKey: "templateCafe" },
    { key: "bakery", labelKey: "templateBakery" },
    { key: "cloud-kitchen", labelKey: "templateCloudKitchen" },
    { key: "custom", labelKey: "templateCustom" },
  ] as const;

  function next() {
    if (step < totalSteps - 1) setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function finish() {
    setSubmitting(true);
    setError(null);
    const result = await completeOnboarding({
      ownerEmail: form.ownerEmail,
      ownerPassword: form.ownerPassword,
      ownerName: form.ownerName || form.companyName,
      companyName: form.companyName,
      businessType: form.template,
      country: form.country,
      city: form.city,
      branchName: form.branchName,
      location: form.location,
      workingHours: form.workingHours,
      preferredLocale: "en",
    });
    // completeOnboarding redirects on success (throws a Next.js redirect),
    // so reaching here means it returned an error instead.
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("stepOf", { current: step + 1, total: totalSteps })}
          </p>
        </div>
        <div className="mx-auto mt-3 h-1.5 max-w-md overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 overflow-hidden px-4 py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col gap-5"
        >
        {step === 0 && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{t("welcome")}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{t("welcomeSubtitle")}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("createOrganization")}</h2>
            <Field label={t("ownerName")} value={form.ownerName} onChange={set("ownerName")} />
            <Field label={t("ownerEmail")} value={form.ownerEmail} onChange={set("ownerEmail")} placeholder="owner@company.com" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-foreground">{t("ownerPassword")}</span>
              <input
                type="password"
                value={form.ownerPassword}
                onChange={(e) => set("ownerPassword")(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <Field label={t("companyName")} value={form.companyName} onChange={set("companyName")} />
            <Field label={t("country")} value={form.country} onChange={set("country")} />
            <Field label={t("city")} value={form.city} onChange={set("city")} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("createBranch")}</h2>
            <Field label={t("branchName")} value={form.branchName} onChange={set("branchName")} />
            <Field label={t("location")} value={form.location} onChange={set("location")} />
            <Field label={t("workingHours")} value={form.workingHours} onChange={set("workingHours")} placeholder="9:00 - 23:00" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("addManager")}</h2>
            <Field label={t("managerName")} value={form.managerName} onChange={set("managerName")} />
            <Field label={t("managerEmail")} value={form.managerEmail} onChange={set("managerEmail")} />
            <Field label={t("managerPhone")} value={form.managerPhone} onChange={set("managerPhone")} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("chooseTemplate")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {templates.map(({ key, labelKey }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("template")(key)}
                  className={`rounded-xl border px-4 py-4 text-sm font-medium transition-colors ${
                    form.template === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-500" />
            <h2 className="text-lg font-semibold">{t("startUsing")}</h2>
            <p className="text-sm text-muted-foreground">{t("trialEndsIn", { days: 14 })}</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}
        </motion.div>
      </AnimatePresence>
      </main>

      <footer className="border-t border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-md gap-3">
          {step > 0 && step < totalSteps - 1 && (
            <button
              type="button"
              onClick={back}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground"
            >
              {t("back")}
            </button>
          )}
          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              {t("next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={submitting}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {submitting ? t("creatingAccount") : t("goToDashboard")}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
