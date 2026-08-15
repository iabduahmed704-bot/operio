import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { CaptureGrid } from "./CaptureGrid";

const captureTypes = [
  { key: "reportWaste", type: "waste" },
  { key: "reportDamage", type: "damage" },
  { key: "reportIssue", type: "issue" },
  { key: "outOfStock", type: "oos" },
  { key: "reportMistake", type: "mistake" },
  { key: "equipmentProblem", type: "equipment" },
  { key: "photoNote", type: "photo-note" },
  { key: "other", type: "other" },
] as const;

export default async function CapturePage() {
  const t = await getTranslations("capture");

  const items = captureTypes.map(({ key, type }) => ({
    type,
    label: t(key),
  }));

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">
        <CaptureGrid items={items} />
      </main>

      <MobileNav />
    </div>
  );
}
