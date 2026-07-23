"use client";

import * as React from "react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

export type ToastVariant = "default" | "success" | "destructive";

export type ToastData = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type Listener = (toasts: ToastData[]) => void;

let toasts: ToastData[] = [];
const listeners: Listener[] = [];

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(data: Omit<ToastData, "id">) {
  const id = crypto.randomUUID();
  toasts = [{ id, ...data }, ...toasts].slice(0, TOAST_LIMIT);
  emit();
  setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY);
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<ToastData[]>(toasts);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { toasts: state, toast, dismiss };
}
