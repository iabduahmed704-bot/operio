"use client";

import { motion } from "framer-motion";

export function DashboardHero({ title }: { title: string }) {
  return (
    <div className="relative overflow-hidden px-4 pt-8 pb-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-24 start-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.35, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
        className="pointer-events-none absolute -top-10 end-0 h-48 w-48 rounded-full bg-accent/30 blur-3xl"
      />
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative text-2xl font-semibold tracking-tight"
      >
        {title}
      </motion.h1>
    </div>
  );
}
