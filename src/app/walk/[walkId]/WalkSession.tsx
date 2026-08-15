"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Camera, X } from "lucide-react";
import { addWalkStop, completeWalk } from "@/lib/actions/walk";
import { createClient } from "@/lib/supabase/client";

type Stop = {
  id: string;
  issue: string | null;
  note: string | null;
  action_taken: string | null;
  photo_url?: string | null;
};

export function WalkSession({
  walkId,
  initialStops,
  isCompleted,
  organizationId,
  branchId,
}: {
  walkId: string;
  initialStops: Stop[];
  isCompleted: boolean;
  organizationId: string | null;
  branchId: string | null;
}) {
  const t = useTranslations("walkPage");
  const router = useRouter();
  const [stops, setStops] = useState(initialStops);
  const [issue, setIssue] = useState("");
  const [note, setNote] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [completed, setCompleted] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function addStop() {
    if (!issue.trim() && !note.trim() && !photoFile) return;
    setError(null);

    startTransition(async () => {
      let photoUrl: string | undefined;

      if (photoFile && organizationId && branchId) {
        const supabase = createClient();
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${organizationId}/${branchId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("capture-photos")
          .upload(path, photoFile, { contentType: photoFile.type });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }
        photoUrl = path;
      }

      const formData = new FormData();
      formData.set("issue", issue);
      formData.set("note", note);
      formData.set("actionTaken", actionTaken);

      const result = await addWalkStop(walkId, formData, photoUrl);
      if (result.error) {
        setError(result.error);
        return;
      }

      setStops((s) => [
        ...s,
        { id: crypto.randomUUID(), issue, note, action_taken: actionTaken, photo_url: photoUrl },
      ]);
      setIssue("");
      setNote("");
      setActionTaken("");
      setPhotoFile(null);
      setPhotoPreview(null);
    });
  }

  function finish() {
    startTransition(async () => {
      await completeWalk(walkId);
      setCompleted(true);
    });
  }

  if (completed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h2 className="text-lg font-semibold">{t("complete")}</h2>
        <p className="text-sm text-muted-foreground">{t("stopsRecorded", { count: stops.length })}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
        >
          {t("backToHome")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 px-4 py-6 md:px-8">
      <div className="space-y-2">
        {stops.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
            {s.photo_url && (
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Camera className="h-4 w-4" />
              </div>
            )}
            {s.issue && <p className="font-medium">{s.issue}</p>}
            {s.note && <p className="text-muted-foreground">{s.note}</p>}
            {s.action_taken && (
              <p className="text-xs text-primary">{t("actionLabel", { action: s.action_taken })}</p>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-2xl border border-border bg-surface p-4">
        <label
          htmlFor="walk-stop-photo"
          className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground"
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <>
              <Camera className="h-6 w-6" />
              <span className="text-xs">{t("addPhoto")}</span>
            </>
          )}
        </label>
        <input
          id="walk-stop-photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPhotoChange}
        />
        {photoPreview && (
          <button
            type="button"
            onClick={() => {
              setPhotoFile(null);
              setPhotoPreview(null);
            }}
            className="inline-flex items-center gap-1 text-xs text-red-500"
          >
            <X className="h-3 w-3" /> {t("removePhoto")}
          </button>
        )}

        <input
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder={t("issuePlaceholder")}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("notePlaceholder")}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          value={actionTaken}
          onChange={(e) => setActionTaken(e.target.value)}
          placeholder={t("actionPlaceholder")}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="button"
          onClick={addStop}
          disabled={isPending}
          className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {t("addStop")}
        </button>
      </div>

      <button
        type="button"
        onClick={finish}
        disabled={isPending}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {t("finish")}
      </button>
    </div>
  );
}
