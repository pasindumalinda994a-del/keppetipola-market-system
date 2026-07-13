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
import { LocaleProvider } from "@/components/providers/locale-provider";

const nav = [
  { href: "/farmer", labelKey: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/farmer/harvest", labelKey: "nav.myHarvest" as const, icon: Leaf },
  { href: "/farmer/offers", labelKey: "nav.traderOffers" as const, icon: HandCoins },
  { href: "/farmer/sales", labelKey: "nav.mySales" as const, icon: ShoppingBag },
  { href: "/farmer/prices", labelKey: "nav.marketPrices" as const, icon: TrendingUp },
  { href: "/farmer/requests", labelKey: "nav.traderRequests" as const, icon: ClipboardList },
  { href: "/farmer/notifications", labelKey: "nav.notifications" as const, icon: Bell },
  { href: "/farmer/profile", labelKey: "nav.profile" as const, icon: User },
  { href: "/farmer/settings", labelKey: "nav.settings" as const, icon: Settings },
];

const mobileNav = [
  { href: "/farmer", labelKey: "nav.home" as const, icon: Home },
  { href: "/farmer/harvest", labelKey: "nav.harvest" as const, icon: Leaf },
  { href: "/farmer/offers", labelKey: "nav.offers" as const, icon: HandCoins },
  { href: "/farmer/requests", labelKey: "nav.requests" as const, icon: Store },
  { href: "/farmer/settings", labelKey: "nav.more" as const, icon: MoreHorizontal },
];

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <PortalShell
        role="farmer"
        titleKey="portal.farmer"
        nav={nav}
        mobileNav={mobileNav}
        notificationHref="/farmer/notifications"
        notificationGroups={["Offers", "Sales", "Announcements", "System"]}
        profileHref="/farmer/profile"
      >
        {children}
      </PortalShell>
    </LocaleProvider>
  );
}
