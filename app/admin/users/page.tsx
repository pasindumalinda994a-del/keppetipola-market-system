"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fillTemplate, type MessageKey } from "@/lib/i18n/messages";
import { users } from "@/lib/mock";
import type { UserRole } from "@/types";

function roleLabel(role: UserRole, t: (key: MessageKey) => string) {
  if (role === "farmer") return t("common.farmer");
  if (role === "trader") return t("common.trader");
  return t("common.admins");
}

function UserTable({ role }: { role: UserRole }) {
  const { t } = useLocale();
  const rows = users.filter((u) => u.role === role);
  return (
    <div className="overflow-hidden rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("common.name")}</TableHead>
            <TableHead>{t("common.role")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell>{roleLabel(u.role, t)}</TableCell>
              <TableCell>
                <StatusBadge status={u.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/users/${u.id}`}>{t("common.view")}</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminUsersPage() {
  const { t } = useLocale();
  const [q, setQ] = useState("");
  const filteredCount = useMemo(() => {
    if (!q) return users.length;
    return users.filter((u) =>
      u.name.toLowerCase().includes(q.toLowerCase())
    ).length;
  }, [q]);

  return (
    <div>
      <PageHeader
        title={t("admin.users.title")}
        description={fillTemplate(t("admin.users.description"), {
          count: filteredCount,
        })}
      />
      <SearchBar
        className="mb-6 max-w-sm"
        value={q}
        onChange={setQ}
        placeholder={t("search.users")}
      />
      <Tabs defaultValue="farmer">
        <TabsList>
          <TabsTrigger value="farmer">{t("common.farmers")}</TabsTrigger>
          <TabsTrigger value="trader">{t("common.traders")}</TabsTrigger>
          <TabsTrigger value="admin">{t("common.admins")}</TabsTrigger>
        </TabsList>
        <TabsContent value="farmer" className="mt-4">
          <UserTable role="farmer" />
        </TabsContent>
        <TabsContent value="trader" className="mt-4">
          <UserTable role="trader" />
        </TabsContent>
        <TabsContent value="admin" className="mt-4">
          <UserTable role="admin" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
