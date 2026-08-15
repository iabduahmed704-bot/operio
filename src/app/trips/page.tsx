import { MobileNav } from "@/components/layout/MobileNav";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TripForm } from "./TripForm";

export default async function TripsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: trips } = user.organization_id
    ? await supabase
        .from("business_trips")
        .select("id, destination, purpose, distance_km, compensation, status, created_at")
        .eq("organization_id", user.organization_id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <header className="border-b border-border px-4 py-6 md:px-8">
        <h1 className="text-xl font-semibold">Business Trips</h1>
      </header>

      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        <TripForm />

        {(!trips || trips.length === 0) ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No trips logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {trips.map((trip) => (
              <li key={trip.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{trip.destination}</p>
                  <span className="text-sm font-semibold">{trip.compensation.toFixed(2)} SAR</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {trip.purpose} · {trip.distance_km} km
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
