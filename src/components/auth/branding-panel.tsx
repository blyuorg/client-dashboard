"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { BlyuLogo } from "@/components/auth/blyu-logo";

const FEATURES = [
  "Secure Authentication",
  "Google Sign In",
  "Real-time Project Tracking",
  "Document Management",
  "End-to-End Encryption",
];

export function BrandingPanel() {
  return (
    <div className="flex h-full flex-col justify-between px-10 py-12 lg:px-16 lg:py-16">
      <BlyuLogo />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md"
      >
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-auth-text lg:text-4xl">
          Manage Your Projects With Confidence
        </h1>
        <p className="mt-4 text-base leading-relaxed text-auth-muted">
          Track projects, invoices, files, tasks, payments and communication from one secure
          dashboard.
        </p>

        <ul className="mt-8 space-y-3">
          {FEATURES.map((feature, i) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: "easeOut" }}
              className="flex items-center gap-2.5 text-sm text-auth-text"
            >
              <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-auth-success" />
              {feature}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <p className="text-xs text-auth-muted">
        Copyright &copy; {new Date().getFullYear()} Blyu
      </p>
    </div>
  );
}
