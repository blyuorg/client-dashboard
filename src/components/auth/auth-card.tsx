"use client";

import { motion } from "framer-motion";
import { BlyuLogo } from "@/components/auth/blyu-logo";
import { cn } from "@/lib/utils";

export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "w-full max-w-[460px] rounded-auth border border-auth-border bg-white p-8 shadow-[0_8px_30px_rgb(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgb(15,23,42,0.09)] sm:p-10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function AuthCardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7 space-y-4 text-center">
      <div className="flex justify-center lg:hidden">
        <BlyuLogo wordmark={false} />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-auth-text">{title}</h2>
        <p className="text-sm text-auth-muted">{subtitle}</p>
      </div>
    </div>
  );
}
