import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewExperimentForm } from "./NewExperimentForm";

export default function NewExperimentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <Link href="/experiments" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">New experiment</h1>
      </header>
      <NewExperimentForm />
    </div>
  );
}
