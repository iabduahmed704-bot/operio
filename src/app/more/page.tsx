import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { getUser } from "@/lib/auth";
import { MoreList } from "./MoreList";

export default async function MorePage() {
  const t = await getTranslations("more");
  const tNav = await getTranslations("nav");
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="flex items-center justify-between border-b border-border px-4 py-6 md:px-8">
        <div>
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          {user && (
            <p className="mt-1 text-sm text-muted-foreground">
              {user.full_name} · {user.email}
            </p>
          )}
        </div>
        <LanguageSwitcher />
      </header>
      <main className="flex-1 px-4 md:px-8">
        <MoreList
          labels={{
            profile: t("profile"),
            settings: t("settings"),
            subscription: t("subscription"),
            branches: tNav("branches"),
            employees: tNav("employees"),
            kpis: tNav("kpis"),
            checklists: tNav("checklists"),
            shifts: tNav("shifts"),
            till: t("till"),
            purchases: t("purchases"),
            incidents: tNav("incidents"),
            overtime: t("overtime"),
            trips: t("trips"),
            experiments: t("experiments"),
            breaks: t("breaks"),
            search: t("search"),
            walk: t("walk"),
            stars: t("stars"),
            logout: t("logout"),
          }}
          showBranches={["organization_owner", "operations_manager"].includes(user?.org_role ?? "")}
        />
      </main>
      <MobileNav />
    </div>
  );
}
