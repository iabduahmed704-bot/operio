import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const tMore = await getTranslations("more");
  const tCommon = await getTranslations("common");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: org } = user.organization_id
    ? await supabase
        .from("organizations")
        .select("default_locale, currency")
        .eq("id", user.organization_id)
        .single()
    : { data: null };

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/more" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{tMore("settings")}</h1>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">
        <SettingsForm
          defaultLocale={org?.default_locale ?? "en"}
          currency={org?.currency ?? "SAR"}
          canEdit={user.org_role === "organization_owner"}
          labels={{
            locale: "Default language",
            currency: "Currency",
            save: tCommon("save"),
            saved: "Saved",
            readonly: "Only the organization owner can change these settings.",
          }}
        />
      </main>
      <MobileNav />
    </div>
  );
}
