import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const tMore = await getTranslations("more");
  const tOnboarding = await getTranslations("onboarding");
  const tCommon = await getTranslations("common");
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/more" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{tMore("profile")}</h1>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">
        <ProfileForm
          fullName={user.full_name}
          email={user.email}
          phone={user.phone}
          labels={{
            name: tOnboarding("ownerName"),
            email: tOnboarding("ownerEmail"),
            phone: tOnboarding("managerPhone"),
            save: tCommon("save"),
            saved: "Saved",
          }}
        />
      </main>
      <MobileNav />
    </div>
  );
}
