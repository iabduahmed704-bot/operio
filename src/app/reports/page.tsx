import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Camera, Footprints } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type FeedRow = {
  id: string;
  description: string;
  severity: string;
  created_at: string;
  kind: string;
  photo_url: string | null;
};

type WalkRow = { id: string; type: string; started_at: string; stopCount: number; photoCount: number };

const walkTypeKey: Record<string, string> = {
  opening: "typeOpening",
  closing: "typeClosing",
  food_safety: "typeFoodSafety",
  cleaning: "typeCleaning",
  equipment: "typeEquipment",
  store_readiness: "typeStoreReadiness",
  custom: "typeCustom",
};

const severityKey: Record<string, string> = {
  low: "severityLow",
  medium: "severityMedium",
  high: "severityHigh",
};

export default async function ReportsPage() {
  const t = await getTranslations("reports");
  const tWalk = await getTranslations("walkPage");
  const tCapture = await getTranslations("capture");
  const user = await requireAuth();
  const supabase = await createClient();

  let feed: FeedRow[] = [];
  let walks: WalkRow[] = [];

  if (user.organization_id) {
    const [waste, damage, oos, incidents, walksData] = await Promise.all([
      supabase
        .from("waste_records")
        .select("id, description, severity, created_at, photo_url")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("damage_records")
        .select("id, description, severity, created_at, photo_url")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("out_of_stock_records")
        .select("id, description, severity, created_at, photo_url")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("incidents")
        .select("id, description, severity, created_at, photo_url")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("walks")
        .select("id, type, started_at, walk_stops(id, photo_url)")
        .eq("organization_id", user.organization_id)
        .not("completed_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(10),
    ]);

    feed = [
      ...(waste.data ?? []).map((r) => ({ ...r, kind: t("wasteLabel") })),
      ...(damage.data ?? []).map((r) => ({ ...r, kind: t("damageLabel") })),
      ...(oos.data ?? []).map((r) => ({ ...r, kind: t("oosLabel") })),
      ...(incidents.data ?? []).map((r) => ({ ...r, kind: t("incidentLabel") })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    walks = (walksData.data ?? []).map((w) => {
      const stops = (w.walk_stops ?? []) as { id: string; photo_url: string | null }[];
      return {
        id: w.id,
        type: w.type,
        started_at: w.started_at,
        stopCount: stops.length,
        photoCount: stops.filter((s) => s.photo_url).length,
      };
    });

    // Sign photo paths for display — the bucket is private.
    const pathsToSign = feed.filter((r) => r.photo_url).map((r) => r.photo_url as string);
    if (pathsToSign.length > 0) {
      const { data: signed } = await supabase.storage
        .from("capture-photos")
        .createSignedUrls(pathsToSign, 3600);
      const urlMap = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
      feed = feed.map((r) => (r.photo_url ? { ...r, photo_url: urlMap.get(r.photo_url) ?? null } : r));
    }
  }

  const hasContent = feed.length > 0 || walks.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </header>
      <main className="flex-1 px-4 md:px-8">
        {!hasContent ? (
          <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <>
            {walks.length > 0 && (
              <div className="mb-4 space-y-2 pt-4">
                {walks.map((w) => (
                  <Link
                    key={w.id}
                    href={`/walk/${w.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                  >
                    <Footprints className="h-5 w-5 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {t("walkLabel", {
                          type: walkTypeKey[w.type] ? tWalk(walkTypeKey[w.type] as "typeOpening") : w.type,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {w.stopCount} {t("stops")} · {new Date(w.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    {w.photoCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Camera className="h-3.5 w-3.5" /> {w.photoCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            <ul className="divide-y divide-border">
              {feed.map((row) => (
                <li key={row.id} className="flex gap-3 py-4">
                  {row.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.photo_url}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-primary">{row.kind}</span>
                      <span
                        className={
                          row.severity === "high"
                            ? "rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500"
                            : row.severity === "medium"
                              ? "rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500"
                              : "rounded-full bg-muted-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {severityKey[row.severity]
                          ? tCapture(severityKey[row.severity] as "severityLow")
                          : row.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{row.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
