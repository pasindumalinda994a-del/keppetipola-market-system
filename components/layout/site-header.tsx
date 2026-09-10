"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { getHashFromHref, scrollToId } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#price-highlights", label: "Live Prices" },
  { href: "/#market-demand", label: "Market Demand" },
  { href: "/trends", label: "Price Trends" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  function onNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    const hash = getHashFromHref(href);
    if (!hash) {
      setOpen(false);
      return;
    }

    if (pathname === "/") {
      e.preventDefault();
      scrollToId(hash);
    }
    setOpen(false);
  }

  function isActive(href: string) {
    if (href.includes("#")) return false;
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)]">
      <div className="guest-wrap flex h-[72px] items-center justify-between">
        <BrandLogo href="/" size="lg" priority />
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {t("status.login")}
          </Link>
          <Button variant="brand" asChild className="h-10 px-5">
            <Link href="/register">{t("auth.register")}</Link>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      <nav className="hidden border-t border-border bg-white md:block">
        <div className="guest-wrap flex items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => onNavClick(e, link.href)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                isActive(link.href)
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      {open ? (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(link.href)
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
                onClick={(e) => onNavClick(e, link.href)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" asChild className="flex-1 rounded-full">
                <Link href="/login">{t("status.login")}</Link>
              </Button>
              <Button variant="brand" asChild className="flex-1">
                <Link href="/register">{t("auth.register")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
