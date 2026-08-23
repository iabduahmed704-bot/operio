import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser) {
    const profile = await getUser();

    if (profile) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{profile.email}</span>
          </p>
          <Link href="/" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Go to dashboard
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-muted-foreground underline">
              Log out
            </button>
          </form>
        </div>
      );
    }

    // A valid auth session exists but no matching `users` profile row —
    // this account can't do anything useful until that's fixed. Offer a
    // clean way out instead of leaving the visitor stuck.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          This account is signed in, but its profile couldn&apos;t be loaded. Log out and try again, or
          contact support.
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Log out
          </button>
        </form>
      </div>
    );
  }

  return <LoginForm />;
}
