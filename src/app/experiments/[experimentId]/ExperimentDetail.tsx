"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateExperimentStats, addExperimentFeedback, type ExperimentStatus } from "@/lib/actions/experiments";

const statuses: ExperimentStatus[] = ["testing", "needs_changes", "approved", "rejected", "launched"];
const statusKey: Record<ExperimentStatus, string> = {
  testing: "statusTesting",
  needs_changes: "statusNeedsChanges",
  approved: "statusApproved",
  rejected: "statusRejected",
  launched: "statusLaunched",
};

type Experiment = {
  id: string;
  product_name: string;
  recipe_notes: string | null;
  cost: number | null;
  prepared_count: number;
  sold_count: number;
  waste_count: number;
  status: ExperimentStatus;
};

type Feedback = { id: string; comment: string; rating: number | null; created_at: string };

export function ExperimentDetail({
  experiment,
  feedback,
}: {
  experiment: Experiment;
  feedback: Feedback[];
}) {
  const t = useTranslations("experimentsPage");
  const [prepared, setPrepared] = useState(experiment.prepared_count);
  const [sold, setSold] = useState(experiment.sold_count);
  const [waste, setWaste] = useState(experiment.waste_count);
  const [status, setStatus] = useState(experiment.status);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function saveStats() {
    startTransition(() => {
      updateExperimentStats(experiment.id, { preparedCount: prepared, soldCount: sold, wasteCount: waste, status });
    });
  }

  function submitFeedback() {
    if (!comment.trim()) return;
    const formData = new FormData();
    formData.set("comment", comment);
    startTransition(async () => {
      await addExperimentFeedback(experiment.id, formData);
      setComment("");
    });
  }

  return (
    <div className="flex-1 space-y-4 px-4 py-6 md:px-8">
      {experiment.recipe_notes && (
        <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
          {experiment.recipe_notes}
        </p>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">{t("prepared")}</span>
            <input
              type="number"
              value={prepared}
              onChange={(e) => setPrepared(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">{t("sold")}</span>
            <input
              type="number"
              value={sold}
              onChange={(e) => setSold(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">{t("waste")}</span>
            <input
              type="number"
              value={waste}
              onChange={(e) => setWaste(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-xs text-muted-foreground">{t("status")}</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ExperimentStatus)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {t(statusKey[s] as "statusTesting")}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={saveStats}
          disabled={isPending}
          className="mt-3 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {t("save")}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-semibold">{t("feedback")}</p>
        <div className="space-y-2">
          {feedback.map((f) => (
            <p key={f.id} className="text-sm text-muted-foreground">
              {f.comment}
            </p>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder={t("addFeedbackPlaceholder")}
          className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={submitFeedback}
          disabled={isPending}
          className="mt-2 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {t("addFeedback")}
        </button>
      </div>
    </div>
  );
}
