"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Chrome, Lock, Sparkles } from "lucide-react";
import { BlyuLogo } from "@/components/auth/blyu-logo";
import { DashboardIllustration } from "@/components/auth/dashboard-illustration";

const FEATURES = [
  { icon: ShieldCheck, label: "Secure Authentication" },
  { icon: Chrome, label: "Google OAuth" },
  { icon: Lock, label: "End-to-End Encryption" },
  { icon: Sparkles, label: "Powered by Supabase" },
];

export function BrandingPanel() {
  return (
    <div className="flex h-full flex-col justify-between gap-10 px-12 py-14 xl:px-20 xl:py-16">
      <BlyuLogo markClassName="h-11 w-11 text-lg" className="gap-3" />

      <div className="grid flex-1 items-center gap-12 xl:grid-cols-[1fr_1fr] xl:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-auth-text xl:text-5xl">
            Welcome back to
            <br />
            Blyu Client Portal.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-auth-muted">
            Manage projects, invoices, documents, messages and billing from one secure dashboard.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {FEATURES.map((feature, i) => (
              <motion.li
                key={feature.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                className="flex items-center gap-2.5 text-sm text-auth-text"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-auth-primary/15">
                  <feature.icon className="h-3.5 w-3.5 text-auth-primary" />
                </span>
                {feature.label}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="hidden xl:block"
        >
          <DashboardIllustration />
        </motion.div>
      </div>

      <p className="text-xs text-auth-muted">Copyright &copy; {new Date().getFullYear()} Blyu</p>
    </div>
  );
}
