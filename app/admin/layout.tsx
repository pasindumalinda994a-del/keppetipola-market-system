"use client";

import {
  Bell,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  Leaf,
  MoreHorizontal,
  Settings,
  ScrollText,
  TrendingUp,
  Users,
  Megaphone,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { LocaleProvider } from "@/components/providers/locale-provider";

const nav = [
  { href: "/admin", labelKey: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/admin/users", labelKey: "nav.userManagement" as const, icon: Users },
  { href: "/admin/stalls", labelKey: "nav.stallManagement" as const, icon: Building2 },
  { href: "/admin/vegetables", labelKey: "nav.vegetableManagement" as const, icon: Leaf },
  { href: "/admin/transactions", labelKey: "nav.transactions" as const, icon: FileText },
  { href: "/admin/prices", labelKey: "nav.marketPrices" as const, icon: TrendingUp },
  { href: "/admin/reports", labelKey: "nav.reports" as const, icon: TrendingUp },
  { href: "/admin/announcements", labelKey: "nav.announcements" as const, icon: Megaphone },
  { href: "/admin/logs", labelKey: "nav.systemLogs" as const, icon: ScrollText },
  { href: "/admin/settings", labelKey: "nav.settings" as const, icon: Settings },
];

const mobileNav = [
  { href: "/admin", labelKey: "nav.home" as const, icon: Home },
  { href: "/admin/users", labelKey: "nav.users" as const, icon: Users },
  { href: "/admin/transactions", labelKey: "nav.txns" as const, icon: FileText },
  { href: "/admin/announcements", labelKey: "nav.news" as const, icon: Bell },
  { href: "/admin/settings", labelKey: "nav.more" as const, icon: MoreHorizontal },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <PortalShell
        role="admin"
        titleKey="portal.admin"
        nav={nav}
        mobileNav={mobileNav}
        notificationHref="/admin/announcements"
        notificationGroups={["Announcements", "System"]}
        profileHref="/admin/settings"
      >
        {children}
      </PortalShell>
    </LocaleProvider>
  );
}
