import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";
import { LogoUploadForm } from "./LogoUploadForm";

export default async function SettingsPage() {
  const tMore = await getTranslations("more");
  const tCommon = await getTranslations("common");
  const t = await getTranslations("settingsPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: org } = user.organization_id
    ? await supabase
        .from("organizations")
        .select("default_locale, currency, logo_url")
        .eq("id", user.organization_id)
        .single()
    : { data: null };

  const canEdit = user.org_role === "organization_owner";

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/more" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{tMore("settings")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        {canEdit && user.organization_id && (
          <LogoUploadForm
            organizationId={user.organization_id}
            currentLogoUrl={org?.logo_url ?? null}
            labels={{
              title: t("companyLogo"),
              upload: t("uploadLogo"),
              uploading: tCommon("loading"),
              saved: t("saved"),
            }}
          />
        )}
        <SettingsForm
          defaultLocale={org?.default_locale ?? "en"}
          currency={org?.currency ?? "SAR"}
          canEdit={canEdit}
          labels={{
            locale: t("defaultLanguage"),
            currency: t("currency"),
            save: tCommon("save"),
            saved: t("saved"),
            readonly: t("readonly"),
          }}
        />
      </main>
      <MobileNav />
    </div>
  );
}
