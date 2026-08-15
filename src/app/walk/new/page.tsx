import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StartWalkButtons } from "./StartWalkButtons";

export default function NewWalkPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">Start a walk</h1>
      </header>
      <StartWalkButtons />
    </div>
  );
}
