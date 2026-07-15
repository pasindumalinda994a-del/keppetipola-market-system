"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NotificationDrawer } from "@/components/layout/notification-drawer";
import { useLocale } from "@/components/providers/locale-provider";
import { getMockUser } from "@/lib/mock-auth";
import type { MessageKey } from "@/lib/i18n/messages";
import type { UserRole } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export type NavItem = {
  href: string;
  labelKey: MessageKey;
  icon: LucideIcon;
};

export function PortalShell({
  role,
  titleKey,
  nav,
  mobileNav,
  children,
  notificationHref,
  notificationGroups,
  profileHref,
}: {
  role: UserRole;
  titleKey: MessageKey;
  nav: NavItem[];
  mobileNav: NavItem[];
  children: React.ReactNode;
  notificationHref: string;
  notificationGroups?: string[];
  profileHref?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const user = getMockUser(role);
  const profile = profileHref ?? `/${role}/settings`;
  const title = t(titleKey);

  function logout() {
    router.push("/login");
  }

  return (
    <div className="min-h-dvh bg-background lg:bg-portal-frame lg:p-3 xl:p-4">
      <div className="flex min-h-dvh lg:min-h-[calc(100dvh-1.5rem)] xl:min-h-[calc(100dvh-2rem)] lg:overflow-hidden lg:rounded-[1.75rem] xl:rounded-[2rem]">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-portal-frame xl:w-64 lg:flex lg:static lg:shrink-0">
          <div className="px-4 py-4 xl:px-5">
            <Link
              href={`/${role}`}
              className="inline-flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <BrandLogo href={null} size="lg" variant="mark" priority />
              <span className="min-w-0 truncate font-heading text-sm font-semibold tracking-tight text-sidebar-foreground">
                {title}
              </span>
            </Link>
          </div>

          <p className="mb-2 px-5 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/40 uppercase">
            {t("shell.navigation")}
          </p>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
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
                    "flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    active &&
                      "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-primary" : "text-sidebar-foreground/45"
                    )}
                  />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 px-4 pb-5">
            <Link
              href={profile}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent/50"
            >
              <Avatar className="size-10 ring-2 ring-sidebar-foreground/10">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {user.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/45 capitalize">
                  {user.role}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            >
              <LogOut className="size-4 shrink-0 text-sidebar-foreground/45" />
              {t("shell.logout")}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-background lg:overflow-hidden lg:rounded-[1.75rem] xl:rounded-[2rem] lg:shadow-[0_8px_32px_rgba(0,0,0,0.22)]">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-8">
            <BrandLogo
              href={`/${role}`}
              size="md"
              variant="mark"
              className="lg:hidden"
            />
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <LanguageToggle />
              <NotificationDrawer
                href={notificationHref}
                groups={notificationGroups}
              />
              <Link
                href={profile}
                className="ml-1 hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline"
              >
                {t("shell.profile")}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-1.5 text-muted-foreground"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">{t("shell.logout")}</span>
              </Button>
            </div>
          </header>

          <main className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 px-4 pb-8 sm:px-6 lg:px-8 lg:pb-8">
              {children}
            </div>
            <footer className="mt-auto border-t border-border/60 px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-4">
              <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                  {t("shell.footer").replace(
                    "{year}",
                    String(new Date().getFullYear())
                  )}
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/faq"
                    className="transition-colors hover:text-foreground"
                  >
                    {t("shell.footer.help")}
                  </Link>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-foreground"
                  >
                    {t("shell.footer.contact")}
                  </Link>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden">
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
                  <span className="truncate">{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
