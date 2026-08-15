import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BreakControl } from "./BreakControl";

export default async function BreaksPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: openBreak } = await supabase
    .from("break_records")
    .select("id")
    .eq("employee_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  const canManage = ["organization_owner", "operations_manager", "branch_manager"].includes(
    user.org_role ?? ""
  );

  const { data: onBreakNow } = canManage && user.organization_id
    ? await supabase
        .from("break_records")
        .select("id, employee_id, started_at, users(full_name)")
        .eq("organization_id", user.organization_id)
        .is("ended_at", null)
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">Breaks</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <BreakControl isOnBreak={!!openBreak} />

        {canManage && onBreakNow && onBreakNow.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Currently on break</p>
            <ul className="space-y-2">
              {onBreakNow.map((b) => {
                const employeeName = Array.isArray(b.users)
                  ? (b.users[0] as { full_name: string } | undefined)?.full_name
                  : (b.users as unknown as { full_name: string } | null)?.full_name;
                return (
                  <li key={b.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
                    {employeeName ?? "Unknown"} — since {new Date(b.started_at).toLocaleTimeString()}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
