"use client";

import { useCallback, useState, type MouseEvent } from "react";

type RippleItem = { id: number; x: number; y: number; size: number };

/**
 * Click-position ripple effect for buttons. Consumers render the returned
 * `ripples` as absolutely-positioned spans inside a `relative overflow-hidden`
 * button and spread `onMouseDown={addRipple}` onto it.
 */
export function useRipple() {
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  const addRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const id = Date.now();
    setRipples((prev) => [
      ...prev,
      { id, size, x: event.clientX - rect.left - size / 2, y: event.clientY - rect.top - size / 2 },
    ]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
  }, []);

  return { ripples, addRipple };
}
