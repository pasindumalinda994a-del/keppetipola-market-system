"use client";

import {
  Bell,
  ClipboardList,
  FileText,
  History,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { LocaleProvider } from "@/components/providers/locale-provider";

const nav = [
  { href: "/trader", labelKey: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/trader/requests", labelKey: "nav.buyingRequests" as const, icon: ClipboardList },
  { href: "/trader/applications", labelKey: "nav.farmerApplications" as const, icon: Users },
  { href: "/trader/orders", labelKey: "nav.purchaseOrders" as const, icon: FileText },
  { href: "/trader/history", labelKey: "nav.purchaseHistory" as const, icon: History },
  { href: "/trader/prices", labelKey: "nav.marketPrices" as const, icon: TrendingUp },
  { href: "/trader/reports", labelKey: "nav.reports" as const, icon: TrendingUp },
  { href: "/trader/notifications", labelKey: "nav.notifications" as const, icon: Bell },
  { href: "/trader/stall", labelKey: "nav.stallProfile" as const, icon: Store },
  { href: "/trader/settings", labelKey: "nav.settings" as const, icon: Settings },
];

const mobileNav = [
  { href: "/trader", labelKey: "nav.home" as const, icon: Home },
  { href: "/trader/requests", labelKey: "nav.requests" as const, icon: ClipboardList },
  { href: "/trader/applications", labelKey: "nav.apps" as const, icon: Users },
  { href: "/trader/orders", labelKey: "nav.orders" as const, icon: FileText },
  { href: "/trader/settings", labelKey: "nav.more" as const, icon: MoreHorizontal },
];

export default function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <PortalShell
        role="trader"
        titleKey="portal.trader"
        nav={nav}
        mobileNav={mobileNav}
        notificationHref="/trader/notifications"
        notificationGroups={["Applications", "Accepted Offers", "Announcements"]}
        profileHref="/trader/stall"
      >
        {children}
      </PortalShell>
    </LocaleProvider>
  );
}
