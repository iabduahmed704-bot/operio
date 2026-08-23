import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";

export function StubPage({
  title,
  body,
  backHref = "/more",
}: {
  title: string;
  body: string;
  backHref?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href={backHref} className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
        {body}
      </main>
      <MobileNav />
    </div>
  );
}
