"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ListChecks, BarChart3, Camera, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkPendingOverlay } from "@/components/ui/LinkPending";

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items: {
    key: "home" | "tasks" | "capture" | "reports" | "more";
    href: string;
    icon: typeof Home;
    primary?: boolean;
  }[] = [
    { key: "home", href: "/", icon: Home },
    { key: "tasks", href: "/tasks", icon: ListChecks },
    { key: "capture", href: "/capture", icon: Camera, primary: true },
    { key: "reports", href: "/reports", icon: BarChart3 },
    { key: "more", href: "/more", icon: Menu },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 px-2 py-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around">
      {items.map(({ key, href, icon: Icon, primary }) => {
        const active = pathname === href;
        if (primary) {
          return (
            <Link key={key} href={href} className="flex flex-col items-center gap-1 -translate-y-3">
              <motion.span
                whileTap={{ scale: 0.9 }}
                className="relative flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                style={{ height: 52, width: 52 }}
              >
                <Icon className="h-6 w-6" />
                <LinkPendingOverlay className="rounded-full bg-primary/70" />
              </motion.span>
              <span className="text-[11px] font-medium text-muted-foreground">{t(key)}</span>
            </Link>
          );
        }
        return (
          <Link
            key={key}
            href={href}
            className="relative flex flex-col items-center gap-1 px-3 py-1"
          >
            <LinkPendingOverlay className="rounded-xl" />
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute -top-2 h-1 w-5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              className={cn(
                "h-5 w-5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-[11px] transition-colors",
                active ? "font-medium text-primary" : "text-muted-foreground"
              )}
            >
              {t(key)}
            </span>
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
