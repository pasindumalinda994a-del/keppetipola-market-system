"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { getHashFromHref, scrollToId } from "@/lib/smooth-scroll";

export function SiteFooter() {
  const pathname = usePathname();

  function onHashClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    const hash = getHashFromHref(href);
    if (hash && pathname === "/") {
      e.preventDefault();
      scrollToId(hash);
    }
  }

  return (
    <footer className="mt-auto border-t border-sidebar-border bg-portal-frame text-sidebar-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <BrandLogo href="/" size="md" variant="onDark" />
          <p className="mt-3 text-sm text-sidebar-foreground/65">
            Wholesale vegetable marketplace helping farmers find the best price
            for today&apos;s harvest.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-sidebar-foreground/65">
            <li>
              <Link
                href="/#price-highlights"
                onClick={(e) => onHashClick(e, "/#price-highlights")}
                className="transition-colors hover:text-primary"
              >
                Live Prices
              </Link>
            </li>
            <li>
              <Link
                href="/#market-demand"
                onClick={(e) => onHashClick(e, "/#market-demand")}
                className="transition-colors hover:text-primary"
              >
                Market Demand
              </Link>
            </li>
            <li>
              <Link
                href="/trends"
                className="transition-colors hover:text-primary"
              >
                Price Trends
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Help</p>
          <ul className="mt-3 space-y-2 text-sm text-sidebar-foreground/65">
            <li>
              <Link
                href="/about"
                className="transition-colors hover:text-primary"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="transition-colors hover:text-primary"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="transition-colors hover:text-primary"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border px-4 py-4 text-center text-xs text-sidebar-foreground/45">
        © {new Date().getFullYear()} Keppetipola Wholesale Market
      </div>
    </footer>
  );
}
