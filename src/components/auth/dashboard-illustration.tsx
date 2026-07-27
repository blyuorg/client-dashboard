"use client";

import { motion } from "framer-motion";
import { Bell, FileText, MessageSquare, Activity, TrendingUp, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

function GlassPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-auth-border bg-auth-card backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}

const PROGRESS = [
  { label: "Website Redesign", value: 82, color: "bg-auth-primary" },
  { label: "Mobile App", value: 54, color: "bg-[#60A5FA]" },
  { label: "Brand Assets", value: 96, color: "bg-auth-success" },
];

const INVOICES = [
  { id: "INV-0231", amount: "$4,200", status: "Paid" },
  { id: "INV-0230", amount: "$1,850", status: "Pending" },
];

const CHART_BARS = [40, 65, 45, 80, 60, 95, 70];

export function DashboardIllustration() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative mx-auto w-full max-w-lg"
    >
      {/* Main window */}
      <motion.div variants={item}>
        <GlassPanel className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-auth-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-auth-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-auth-success/70" />
            </div>
            <span className="text-xs font-medium text-auth-muted">Blyu Dashboard</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Project progress */}
            <motion.div variants={item} className="col-span-2">
              <GlassPanel className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-auth-primary" />
                  <span className="text-xs font-medium text-auth-text">Project Progress</span>
                </div>
                <div className="space-y-2.5">
                  {PROGRESS.map((p) => (
                    <div key={p.label}>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-auth-muted">
                        <span>{p.label}</span>
                        <span>{p.value}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.value}%` }}
                          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                          className={cn("h-full rounded-full", p.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>

            {/* Invoices */}
            <motion.div variants={item}>
              <GlassPanel className="h-full p-3.5">
                <div className="mb-2.5 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-auth-primary" />
                  <span className="text-xs font-medium text-auth-text">Invoices</span>
                </div>
                <div className="space-y-2">
                  {INVOICES.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-auth-muted">{inv.id}</span>
                      <span className="text-auth-text">{inv.amount}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>

            {/* Billing chart */}
            <motion.div variants={item}>
              <GlassPanel className="h-full p-3.5">
                <div className="mb-2.5 flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-auth-primary" />
                  <span className="text-xs font-medium text-auth-text">Billing</span>
                </div>
                <div className="flex h-10 items-end gap-1">
                  {CHART_BARS.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: 0.9 + i * 0.05, ease: "easeOut" }}
                      className="flex-1 rounded-sm bg-gradient-to-t from-auth-primary to-[#60A5FA]"
                    />
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Floating notification card */}
      <motion.div
        variants={item}
        className="absolute -right-8 -top-10 animate-float"
        style={{ animationDelay: "-1.5s" }}
      >
        <GlassPanel className="flex items-center gap-2.5 p-3 pr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-auth-primary/15">
            <Bell className="h-4 w-4 text-auth-primary" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-auth-text">New notification</p>
            <p className="text-[10px] text-auth-muted">Invoice approved</p>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Floating messages card */}
      <motion.div
        variants={item}
        className="absolute -bottom-8 -left-8 animate-float"
        style={{ animationDelay: "-3.2s" }}
      >
        <GlassPanel className="flex items-center gap-2.5 p-3 pr-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#60A5FA]/15">
            <MessageSquare className="h-4 w-4 text-[#60A5FA]" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-auth-text">2 new messages</p>
            <p className="text-[10px] text-auth-muted">From your team</p>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Floating activity card */}
      <motion.div
        variants={item}
        className="absolute -right-12 -bottom-6 hidden animate-float xl:block"
        style={{ animationDelay: "-4.6s" }}
      >
        <GlassPanel className="flex items-center gap-2.5 p-3 pr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-auth-success/15">
            <Activity className="h-4 w-4 text-auth-success" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-auth-text">Recent Activity</p>
            <p className="text-[10px] text-auth-muted">Design synced</p>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
