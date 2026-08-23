"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, BarChart3, Camera, Menu, Wallet, Coffee, ClipboardList } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { LinkPendingOverlay } from "@/components/ui/LinkPending";

const noSidebarPaths = ["/login", "/onboarding", "/join", "/offline"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const tNav = useTranslations("nav");
  const tMore = useTranslations("more");
  const pathname = usePathname();
  const showSidebar = !noSidebarPaths.some((path) => pathname.startsWith(path));

  if (!showSidebar) return <>{children}</>;

  const quickItems = [
    { key: "till", href: "/till", icon: Wallet, label: tMore("till") },
    { key: "checklists", href: "/checklists", icon: ClipboardList, label: tNav("checklists") },
    { key: "breaks", href: "/breaks", icon: Coffee, label: tMore("breaks") },
  ];

  const items = [
    { key: "home", href: "/", icon: Home, label: tNav("home") },
    { key: "tasks", href: "/tasks", icon: ListChecks, label: tNav("tasks") },
    { key: "capture", href: "/capture", icon: Camera, label: tNav("capture") },
    { key: "reports", href: "/reports", icon: BarChart3, label: tNav("reports") },
    { key: "more", href: "/more", icon: Menu, label: tNav("more") },
  ];

  return (
    <>
      <aside className="fixed inset-y-0 start-0 z-40 flex w-16 flex-col border-e border-border bg-surface md:w-56">
        <div className="hidden items-center px-5 py-6 md:flex">
          <Logo height={28} />
        </div>
        <div className="flex items-center justify-center py-5 md:hidden">
          <Logo height={22} />
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2 md:px-3">
          {quickItems.map(({ key, href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  "relative flex items-center justify-center gap-3 rounded-xl px-0 py-3 text-sm transition-colors md:justify-start md:px-3",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <LinkPendingOverlay className="rounded-xl" />
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden md:inline">{label}</span>
                {active && <span className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-primary md:hidden" />}
              </Link>
            );
          })}

          <div className="my-2 border-t border-border" />

          {items.map(({ key, href, icon: Icon, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  "relative flex items-center justify-center gap-3 rounded-xl px-0 py-3 text-sm transition-colors md:justify-start md:px-3",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <LinkPendingOverlay className="rounded-xl" />
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden md:inline">{label}</span>
                {active && <span className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-primary md:hidden" />}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="ps-16 md:ps-56">{children}</div>
    </>
  );
}
