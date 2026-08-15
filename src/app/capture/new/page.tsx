import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { CaptureForm } from "./CaptureForm";

const typeToLabelKey: Record<string, string> = {
  waste: "reportWaste",
  damage: "reportDamage",
  issue: "reportIssue",
  oos: "outOfStock",
  mistake: "reportMistake",
  equipment: "equipmentProblem",
  "photo-note": "photoNote",
  other: "other",
};

export default async function CaptureNewPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "other" } = await searchParams;
  const t = await getTranslations("capture");
  const labelKey = typeToLabelKey[type] ?? "other";
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/capture" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{t(labelKey as "other")}</h1>
      </header>

      <CaptureForm
        type={type}
        label={t(labelKey as "other")}
        organizationId={user.organization_id}
        branchId={user.branch_id}
      />
    </div>
  );
}
