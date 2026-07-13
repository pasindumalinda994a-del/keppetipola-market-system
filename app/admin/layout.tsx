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

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/stalls", label: "Stall Management", icon: Building2 },
  { href: "/admin/vegetables", label: "Vegetable Management", icon: Leaf },
  { href: "/admin/transactions", label: "Transactions", icon: FileText },
  { href: "/admin/prices", label: "Market Prices", icon: TrendingUp },
  { href: "/admin/reports", label: "Reports", icon: TrendingUp },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/logs", label: "System Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const mobileNav = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Txns", icon: FileText },
  { href: "/admin/announcements", label: "News", icon: Bell },
  { href: "/admin/settings", label: "More", icon: MoreHorizontal },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      role="admin"
      title="Admin Portal"
      nav={nav}
      mobileNav={mobileNav}
      notificationHref="/admin/announcements"
      notificationGroups={["Announcements", "System"]}
      profileHref="/admin/settings"
    >
      {children}
    </PortalShell>
  );
}
