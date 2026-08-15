"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trash2,
  ShieldAlert,
  AlertTriangle,
  PackageX,
  Frown,
  Wrench,
  Camera as CameraIcon,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

const iconMap = {
  waste: Trash2,
  damage: ShieldAlert,
  issue: AlertTriangle,
  oos: PackageX,
  mistake: Frown,
  equipment: Wrench,
  "photo-note": CameraIcon,
  other: MoreHorizontal,
} satisfies Record<string, LucideIcon>;

const colorMap: Record<keyof typeof iconMap, string> = {
  waste: "bg-red-500/10 text-red-500",
  damage: "bg-orange-500/10 text-orange-500",
  issue: "bg-amber-500/10 text-amber-500",
  oos: "bg-blue-500/10 text-blue-500",
  mistake: "bg-purple-500/10 text-purple-500",
  equipment: "bg-slate-500/10 text-slate-400",
  "photo-note": "bg-emerald-500/10 text-emerald-500",
  other: "bg-muted-foreground/10 text-muted-foreground",
};

export function CaptureGrid({
  items,
}: {
  items: { type: keyof typeof iconMap; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(({ type, label }, i) => {
        const Icon = iconMap[type];
        return (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
          >
            <Link href={`/capture/new?type=${type}`} className="block">
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center shadow-sm transition-shadow hover:shadow-lg"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${colorMap[type]}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
