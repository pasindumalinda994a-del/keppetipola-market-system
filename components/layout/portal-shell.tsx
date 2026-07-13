"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDrawer } from "@/components/layout/notification-drawer";
import { getMockUser } from "@/lib/mock-auth";
import type { UserRole } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function PortalShell({
  role,
  title,
  nav,
  mobileNav,
  children,
  notificationHref,
  notificationGroups,
  profileHref,
}: {
  role: UserRole;
  title: string;
  nav: NavItem[];
  mobileNav: NavItem[];
  children: React.ReactNode;
  notificationHref: string;
  notificationGroups?: string[];
  profileHref?: string;
}) {
  const pathname = usePathname();
  const user = getMockUser(role);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b px-5">
          <Link href={`/${role}`} className="font-heading text-lg font-semibold text-primary">
            {title}
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${role}` && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-md">
          <p className="font-heading text-base font-semibold text-primary lg:hidden">
            {title}
          </p>
          <div className="ml-auto flex items-center gap-1">
            <NotificationDrawer
              href={notificationHref}
              groups={notificationGroups}
            />
            <Link
              href={profileHref ?? `/${role}/settings`}
              className="ml-1 hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              Profile
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 pb-24 lg:px-8 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-md lg:hidden">
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1">
          {mobileNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${role}` && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium text-muted-foreground",
                    active && "text-primary"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
