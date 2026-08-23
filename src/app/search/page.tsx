import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { SearchClient } from "./SearchClient";

export default async function SearchPage() {
  const t = await getTranslations("searchPage");
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{t("title")}</h1>
      </header>
      <SearchClient />
      <MobileNav />
    </div>
  );
}
