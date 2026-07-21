"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import {
  ToastProvider as RadixToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";

type ToastState = { id: number; title: string; description?: string } | null;

const SettingsToastContext = React.createContext<((title: string, description?: string) => void) | null>(null);

export function useSettingsToast() {
  const ctx = React.useContext(SettingsToastContext);
  if (!ctx) throw new Error("useSettingsToast must be used within SettingsToastProvider");
  return ctx;
}

export function SettingsToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<ToastState>(null);
  const [open, setOpen] = React.useState(false);

  const show = React.useCallback((title: string, description?: string) => {
    setToast({ id: Date.now(), title, description });
    setOpen(true);
  }, []);

  return (
    <SettingsToastContext.Provider value={show}>
      <RadixToastProvider swipeDirection="right" duration={3200}>
        {children}
        {toast && (
          <Toast open={open} onOpenChange={setOpen}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="min-w-0">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            </div>
          </Toast>
        )}
        <ToastViewport />
      </RadixToastProvider>
    </SettingsToastContext.Provider>
  );
}
