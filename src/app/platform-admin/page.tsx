import { requirePlatformAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PlatformAdminPage() {
  await requirePlatformAdmin();
  const admin = createAdminClient();

  const [orgs, subscriptions, users, branches] = await Promise.all([
    admin.from("organizations").select("id, name, suspended, created_at"),
    admin.from("subscriptions").select("organization_id, status, plans(name)"),
    admin.from("users").select("id", { count: "exact", head: true }),
    admin.from("branches").select("id", { count: "exact", head: true }),
  ]);

  const totalOrgs = orgs.data?.length ?? 0;
  const activeOrgs = orgs.data?.filter((o) => !o.suspended).length ?? 0;
  const statusCounts = (subscriptions.data ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  const metrics = [
    { label: "Total organizations", value: totalOrgs },
    { label: "Active organizations", value: activeOrgs },
    { label: "Trial organizations", value: statusCounts.trialing ?? 0 },
    { label: "Paid organizations", value: statusCounts.active ?? 0 },
    { label: "Total users", value: users.count ?? 0 },
    { label: "Total branches", value: branches.count ?? 0 },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">Platform Admin</h1>
        <p className="text-sm text-muted-foreground">SaaS-wide metrics across all organizations.</p>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-2xl font-semibold">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Organizations</h2>
          <ul className="space-y-2">
            {(orgs.data ?? []).map((org) => (
              <li key={org.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
                <span className="text-sm font-medium">{org.name}</span>
                <span
                  className={
                    org.suspended
                      ? "rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500"
                      : "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500"
                  }
                >
                  {org.suspended ? "Suspended" : "Active"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
