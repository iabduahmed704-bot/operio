"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressToWebP } from "@/lib/image";
import { updateOrganizationLogo } from "@/lib/actions/company";

export function LogoUploadForm({
  organizationId,
  currentLogoUrl,
  labels,
}: {
  organizationId: string;
  currentLogoUrl: string | null;
  labels: { title: string; upload: string; uploading: string; saved: string };
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSaved(false);
    setError(null);

    try {
      const compressed = await compressToWebP(file, 512, 0.9);
      const supabase = createClient();
      const path = `${organizationId}/logo.webp`;

      const { error: uploadError } = await supabase.storage
        .from("org-logos")
        .upload(path, compressed, { upsert: true, contentType: "image/webp" });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("org-logos").getPublicUrl(path);
      const logoUrl = `${data.publicUrl}?v=${Date.now()}`;

      const result = await updateOrganizationLogo(logoUrl);
      if (result.error) {
        setError(result.error);
        return;
      }

      setPreview(logoUrl);
      setSaved(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-medium">{labels.title}</p>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
          {preview ? (
            <Image src={preview} alt="Logo" width={64} height={64} className="h-full w-full object-contain" unoptimized />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {uploading ? labels.uploading : labels.upload}
          </button>
          {saved && <p className="mt-2 text-sm text-emerald-500">{labels.saved}</p>}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
