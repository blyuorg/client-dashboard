"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant = "default" }) => (
        <Toast
          key={id}
          onOpenChange={(open) => {
            if (!open) dismiss(id);
          }}
        >
          {variant === "success" && (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          )}
          {variant === "destructive" && (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          )}
          <div className="grid flex-1 gap-1">
            {title && (
              <ToastTitle
                className={cn(
                  variant === "success" && "text-success",
                  variant === "destructive" && "text-destructive"
                )}
              >
                {title}
              </ToastTitle>
            )}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
