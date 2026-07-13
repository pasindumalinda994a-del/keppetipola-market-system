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

const nav = [
  { href: "/trader", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trader/requests", label: "Buying Requests", icon: ClipboardList },
  { href: "/trader/applications", label: "Farmer Applications", icon: Users },
  { href: "/trader/orders", label: "Purchase Orders", icon: FileText },
  { href: "/trader/history", label: "Purchase History", icon: History },
  { href: "/trader/prices", label: "Market Prices", icon: TrendingUp },
  { href: "/trader/reports", label: "Reports", icon: TrendingUp },
  { href: "/trader/notifications", label: "Notifications", icon: Bell },
  { href: "/trader/stall", label: "Stall Profile", icon: Store },
  { href: "/trader/settings", label: "Settings", icon: Settings },
];

const mobileNav = [
  { href: "/trader", label: "Home", icon: Home },
  { href: "/trader/requests", label: "Requests", icon: ClipboardList },
  { href: "/trader/applications", label: "Apps", icon: Users },
  { href: "/trader/orders", label: "Orders", icon: FileText },
  { href: "/trader/settings", label: "More", icon: MoreHorizontal },
];

export default function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      role="trader"
      title="Trader Portal"
      nav={nav}
      mobileNav={mobileNav}
      notificationHref="/trader/notifications"
      notificationGroups={["Applications", "Accepted Offers", "Announcements"]}
      profileHref="/trader/stall"
    >
      {children}
    </PortalShell>
  );
}
