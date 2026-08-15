import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ExperimentDetail } from "./ExperimentDetail";

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ experimentId: string }>;
}) {
  const { experimentId } = await params;
  await requireAuth();
  const supabase = await createClient();

  const [{ data: experiment }, { data: feedback }] = await Promise.all([
    supabase.from("menu_experiments").select("*").eq("id", experimentId).maybeSingle(),
    supabase
      .from("experiment_feedback")
      .select("id, comment, rating, created_at")
      .eq("experiment_id", experimentId)
      .order("created_at", { ascending: false }),
  ]);

  if (!experiment) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/experiments" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{experiment.product_name}</h1>
      </header>
      <ExperimentDetail experiment={experiment} feedback={feedback ?? []} />
    </div>
  );
}
