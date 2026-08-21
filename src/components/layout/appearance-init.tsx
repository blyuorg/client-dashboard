"use client";

import { useEffect } from "react";
import type { AccentColor, FontSize } from "@/lib/settings/types";

/**
 * Applies the persisted accent color / font size to the real <html> element
 * on mount. <html> itself is rendered by the root layout (src/app/layout.tsx),
 * outside this (dashboard) subtree, so this reaches it the same way the
 * existing Reduce-Motion setting already did: a plain DOM attribute set from
 * a client effect, not a prop threaded through the tree.
 */
export function AppearanceInit({ accent, fontSize }: { accent: AccentColor; fontSize: FontSize }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [accent, fontSize]);

  return null;
}
