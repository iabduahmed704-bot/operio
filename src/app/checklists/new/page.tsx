import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewTemplateForm } from "./NewTemplateForm";

export default async function NewChecklistPage() {
  const t = await getTranslations("checklists");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/checklists" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{t("newChecklist")}</h1>
      </header>
      <NewTemplateForm />
    </div>
  );
}
