import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabasePublishableKey } from "./env";

// Once migrations are applied, run `supabase gen types typescript` and
// parametrize these clients with the generated Database type.
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}
