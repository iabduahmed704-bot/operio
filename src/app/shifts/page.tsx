import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { HandoverForm } from "./HandoverForm";

const shiftKey: Record<string, string> = {
  opening: "typeOpening",
  morning: "typeMorning",
  afternoon: "typeAfternoon",
  closing: "typeClosing",
};

export default async function ShiftsPage() {
  const tNav = await getTranslations("nav");
  const t = await getTranslations("shiftsPage");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: handovers } = user.organization_id
    ? await supabase
        .from("shift_handovers")
        .select("id, shift_label, notes, created_at")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">{tNav("shifts")}</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <HandoverForm />

        <ul className="space-y-2">
          {(handovers ?? []).map((h) => (
            <li key={h.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  {shiftKey[h.shift_label] ? t(shiftKey[h.shift_label] as "typeOpening") : h.shift_label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm">{h.notes}</p>
            </li>
          ))}
        </ul>
      </main>
      <MobileNav />
    </div>
  );
}
