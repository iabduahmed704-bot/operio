"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Settings2,
  CreditCard,
  Building2,
  Users,
  BarChart3,
  ClipboardList,
  Wallet,
  ShoppingCart,
  AlertOctagon,
  Clock,
  Car,
  FlaskConical,
  Coffee,
  Search,
  Footprints,
  Star,
  Bell,
  PackageX,
  Flame,
  ShieldAlert,
  Boxes,
  BookOpen,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { LinkPendingOverlay } from "@/components/ui/LinkPending";

type LinkItem = { href: string; label: string; icon: typeof User };

export function MoreList({
  labels,
  showBranches,
}: {
  labels: {
    profile: string;
    settings: string;
    subscription: string;
    branches: string;
    employees: string;
    kpis: string;
    checklists: string;
    shifts: string;
    till: string;
    purchases: string;
    incidents: string;
    criticalIssues: string;
    overtime: string;
    trips: string;
    experiments: string;
    breaks: string;
    search: string;
    walk: string;
    stars: string;
    reminders: string;
    outOfStock: string;
    waste: string;
    inventory: string;
    howTo: string;
    help: string;
    workGroup: string;
    reportsGroup: string;
    howToGroup: string;
    moreGroup: string;
    logout: string;
  };
  showBranches: boolean;
}) {
  const groups: { key: string; label: string; icon: typeof Briefcase; links: LinkItem[] }[] = [
    {
      key: "work",
      label: labels.workGroup,
      icon: Briefcase,
      links: [
        { href: "/checklists", label: labels.checklists, icon: ClipboardList },
        { href: "/breaks", label: labels.breaks, icon: Coffee },
        { href: "/reminders", label: labels.reminders, icon: Bell },
        { href: "/till", label: labels.till, icon: Wallet },
        { href: "/experiments", label: labels.experiments, icon: FlaskConical },
        { href: "/purchases", label: labels.purchases, icon: ShoppingCart },
        { href: "/trips", label: labels.trips, icon: Car },
        { href: "/overtime", label: labels.overtime, icon: Clock },
      ],
    },
    {
      key: "reports",
      label: labels.reportsGroup,
      icon: BarChart3,
      links: [
        { href: "/walk/new", label: labels.walk, icon: Footprints },
        { href: "/incidents", label: labels.incidents, icon: AlertOctagon },
        { href: "/out-of-stock", label: labels.outOfStock, icon: PackageX },
        { href: "/capture", label: labels.waste, icon: Flame },
        { href: "/incidents", label: labels.criticalIssues, icon: ShieldAlert },
        { href: "/inventory", label: labels.inventory, icon: Boxes },
      ],
    },
    {
      key: "howto",
      label: labels.howToGroup,
      icon: BookOpen,
      links: [{ href: "/how-to", label: labels.howTo, icon: BookOpen }],
    },
    {
      key: "more",
      label: labels.moreGroup,
      icon: Settings2,
      links: [
        { href: "/profile", label: labels.profile, icon: User },
        { href: "/search", label: labels.search, icon: Search },
        { href: "/stars", label: labels.stars, icon: Star },
        ...(showBranches
          ? [
              { href: "/branches", label: labels.branches, icon: Building2 },
              { href: "/employees", label: labels.employees, icon: Users },
              { href: "/kpis", label: labels.kpis, icon: BarChart3 },
            ]
          : []),
        { href: "/settings", label: labels.settings, icon: Settings2 },
        { href: "/subscription", label: labels.subscription, icon: CreditCard },
        { href: "/more", label: labels.help, icon: HelpCircle },
      ],
    },
  ];

  const [openKey, setOpenKey] = useState<string | null>("work");

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const open = openKey === group.key;
        const GroupIcon = group.icon;
        return (
          <div key={group.key} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <button
              type="button"
              onClick={() => setOpenKey(open ? null : group.key)}
              className="flex w-full items-center justify-between px-4 py-4 text-start"
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <GroupIcon className="h-4 w-4 text-primary" />
                {group.label}
              </span>
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
              )}
            </button>
            {open && (
              <div className="divide-y divide-border border-t border-border px-4">
                {group.links.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center justify-between py-3 text-sm transition-colors active:opacity-60"
                  >
                    <LinkPendingOverlay />
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-4 text-start text-sm text-red-500 transition-colors active:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {labels.logout}
        </button>
      </form>
    </div>
  );
}
