import { createBrowserClient } from "@supabase/ssr";

// Once migrations are applied, run `supabase gen types typescript` and
// parametrize these clients with the generated Database type.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
