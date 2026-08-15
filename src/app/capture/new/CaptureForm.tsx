"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Camera, CheckCircle2, X } from "lucide-react";
import { submitCaptureReport, type CaptureType } from "@/lib/actions/capture";
import { createClient } from "@/lib/supabase/client";

const severities = ["low", "medium", "high"] as const;

export function CaptureForm({
  type,
  label,
  organizationId,
  branchId,
}: {
  type: string;
  label: string;
  organizationId: string | null;
  branchId: string | null;
}) {
  const t = useTranslations("capture");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<(typeof severities)[number]>("low");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto(): Promise<string | undefined> {
    if (!photoFile || !organizationId || !branchId) return undefined;

    const supabase = createClient();
    const ext = photoFile.name.split(".").pop() ?? "jpg";
    const path = `${organizationId}/${branchId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("capture-photos")
      .upload(path, photoFile, { contentType: photoFile.type });

    if (uploadError) throw uploadError;
    return path;
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);

    let photoUrl: string | undefined;
    try {
      photoUrl = await uploadPhoto();
    } catch (e) {
      setSubmitting(false);
      setError(e instanceof Error ? e.message : "Photo upload failed");
      return;
    }

    const result = await submitCaptureReport({
      type: type as CaptureType,
      description,
      severity,
      photoUrl,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h2 className="text-lg font-semibold">{t("submitted")}</h2>
        <p className="max-w-xs text-sm text-muted-foreground">{t("submittedBody")}</p>
        <button
          type="button"
          onClick={() => router.push("/capture")}
          className="mt-2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
        >
          {t("backToCapture")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-6 md:px-8">
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("category")}</label>
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium">{label}</div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("addPhoto")}</label>
        <label
          htmlFor="capture-photo"
          className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface text-muted-foreground"
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="" className="h-full w-full rounded-2xl object-cover" />
          ) : (
            <>
              <Camera className="h-8 w-8" />
              <span className="text-sm">{t("takePhoto")}</span>
            </>
          )}
        </label>
        <input
          id="capture-photo"
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
            className="mt-2 inline-flex items-center gap-1 text-xs text-red-500"
          >
            <X className="h-3 w-3" /> {tCommon("cancel")}
          </button>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("description")}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("severity")}</label>
        <div className="flex gap-2">
          {severities.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                severity === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground"
              }`}
            >
              {t(`severity${s.charAt(0).toUpperCase()}${s.slice(1)}` as "severityLow")}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="mt-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-60"
      >
        {submitting ? tCommon("loading") : t("submitReport")}
      </button>
    </div>
  );
}
