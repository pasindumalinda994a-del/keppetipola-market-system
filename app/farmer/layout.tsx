"use client";

import {
  Bell,
  ClipboardList,
  HandCoins,
  Home,
  LayoutDashboard,
  Leaf,
  MoreHorizontal,
  Settings,
  ShoppingBag,
  Store,
  TrendingUp,
  User,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

const nav = [
  { href: "/farmer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/farmer/harvest", label: "My Harvest", icon: Leaf },
  { href: "/farmer/offers", label: "Trader Offers", icon: HandCoins },
  { href: "/farmer/sales", label: "My Sales", icon: ShoppingBag },
  { href: "/farmer/prices", label: "Market Prices", icon: TrendingUp },
  { href: "/farmer/requests", label: "Trader Requests", icon: ClipboardList },
  { href: "/farmer/notifications", label: "Notifications", icon: Bell },
  { href: "/farmer/profile", label: "Profile", icon: User },
  { href: "/farmer/settings", label: "Settings", icon: Settings },
];

const mobileNav = [
  { href: "/farmer", label: "Home", icon: Home },
  { href: "/farmer/harvest", label: "Harvest", icon: Leaf },
  { href: "/farmer/offers", label: "Offers", icon: HandCoins },
  { href: "/farmer/requests", label: "Requests", icon: Store },
  { href: "/farmer/settings", label: "More", icon: MoreHorizontal },
];

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      role="farmer"
      title="Farmer Portal"
      nav={nav}
      mobileNav={mobileNav}
      notificationHref="/farmer/notifications"
      notificationGroups={["Offers", "Sales", "Announcements", "System"]}
      profileHref="/farmer/profile"
    >
      {children}
    </PortalShell>
  );
}
