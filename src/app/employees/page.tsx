import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InviteForm } from "./InviteForm";

const roleKey: Record<string, string> = {
  organization_owner: "roleOrganizationOwner",
  operations_manager: "roleOperationsManager",
  branch_manager: "roleBranchManager",
  supervisor: "roleSupervisor",
  employee: "roleEmployee",
};

export default async function EmployeesPage() {
  const tNav = await getTranslations("nav");
  const t = await getTranslations("employeesPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: members } = user.organization_id
    ? await supabase
        .from("users")
        .select("id, full_name, email, org_role, is_active")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const canInvite = ["organization_owner", "operations_manager", "branch_manager"].includes(
    user.org_role ?? ""
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/more" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{tNav("employees")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <ul className="space-y-2">
          {(members ?? []).map((member) => (
            <li key={member.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
              <div>
                <p className="text-sm font-medium">{member.full_name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {member.org_role && roleKey[member.org_role]
                  ? t(roleKey[member.org_role] as "roleEmployee")
                  : member.org_role}
              </span>
            </li>
          ))}
        </ul>

        {canInvite && <InviteForm />}
      </main>
      <MobileNav />
    </div>
  );
}
