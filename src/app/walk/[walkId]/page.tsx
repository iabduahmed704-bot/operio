import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WalkSession } from "./WalkSession";

export default async function WalkDetailPage({
  params,
}: {
  params: Promise<{ walkId: string }>;
}) {
  const { walkId } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const [{ data: walk }, { data: stops }] = await Promise.all([
    supabase.from("walks").select("*").eq("id", walkId).maybeSingle(),
    supabase.from("walk_stops").select("*").eq("walk_id", walkId).order("created_at", { ascending: true }),
  ]);

  if (!walk) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{walk.type.replace(/_/g, " ")} walk</h1>
      </header>
      <WalkSession
        walkId={walkId}
        initialStops={stops ?? []}
        isCompleted={!!walk.completed_at}
        organizationId={user.organization_id}
        branchId={user.branch_id}
      />
    </div>
  );
}
