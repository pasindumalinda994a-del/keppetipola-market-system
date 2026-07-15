"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToId } from "@/lib/smooth-scroll";

/** Smooth-scroll to window.location.hash after client navigation. */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Wait a tick so the target section is in the DOM after route change.
    const id = window.setTimeout(() => scrollToId(hash), 50);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
