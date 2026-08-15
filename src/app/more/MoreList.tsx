"use client";

import Link from "next/link";
import {
  User,
  Settings2,
  CreditCard,
  Building2,
  Users,
  BarChart3,
  ClipboardList,
  Repeat,
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
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

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
    overtime: string;
    trips: string;
    experiments: string;
    breaks: string;
    search: string;
    walk: string;
    stars: string;
    logout: string;
  };
  showBranches: boolean;
}) {
  const links = [
    { href: "/profile", label: labels.profile, icon: User },
    { href: "/search", label: labels.search, icon: Search },
    { href: "/walk/new", label: labels.walk, icon: Footprints },
    { href: "/stars", label: labels.stars, icon: Star },
    { href: "/checklists", label: labels.checklists, icon: ClipboardList },
    { href: "/shifts", label: labels.shifts, icon: Repeat },
    { href: "/breaks", label: labels.breaks, icon: Coffee },
    { href: "/till", label: labels.till, icon: Wallet },
    { href: "/purchases", label: labels.purchases, icon: ShoppingCart },
    { href: "/incidents", label: labels.incidents, icon: AlertOctagon },
    { href: "/overtime", label: labels.overtime, icon: Clock },
    { href: "/trips", label: labels.trips, icon: Car },
    { href: "/experiments", label: labels.experiments, icon: FlaskConical },
    ...(showBranches
      ? [
          { href: "/branches", label: labels.branches, icon: Building2 },
          { href: "/employees", label: labels.employees, icon: Users },
          { href: "/kpis", label: labels.kpis, icon: BarChart3 },
        ]
      : []),
    { href: "/settings", label: labels.settings, icon: Settings2 },
    { href: "/subscription", label: labels.subscription, icon: CreditCard },
  ];

  return (
    <div className="divide-y divide-border">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center justify-between py-4 text-sm transition-colors active:opacity-60"
        >
          <span className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
        </Link>
      ))}

      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 py-4 text-start text-sm text-red-500 transition-colors active:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {labels.logout}
        </button>
      </form>
    </div>
  );
}
