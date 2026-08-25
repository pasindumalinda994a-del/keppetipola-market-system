"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, fetchUsers } from "@/lib/api";
import { fillTemplate, type MessageKey } from "@/lib/i18n/messages";
import type { User, UserRole } from "@/types";

function roleLabel(role: UserRole, t: (key: MessageKey) => string) {
  if (role === "farmer") return t("common.farmer");
  if (role === "trader") return t("common.trader");
  return t("common.admins");
}

function UserTable({ users }: { users: User[] }) {
  const { t } = useLocale();

  if (users.length === 0) {
    return (
      <p className="rounded-lg bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        {t("admin.users.noUsers")}
      </p>
    );
  }

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
          {users.map((u) => (
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
  const { token } = useAuth();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUsers(token!);
        if (!cancelled) setUsers(data.users);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t("common.requestFailed")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const filtered = useMemo(() => {
    if (!q.trim()) return users;
    const query = q.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }, [q, users]);

  const pending = filtered.filter(
    (u) =>
      u.status === "Pending" && (u.role === "farmer" || u.role === "trader")
  );

  return (
    <div>
      <PageHeader
        title={t("admin.users.title")}
        description={fillTemplate(t("admin.users.description"), {
          count: filtered.length,
        })}
      />
      <SearchBar
        className="mb-6 max-w-sm"
        value={q}
        onChange={setQ}
        placeholder={t("search.users")}
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : (
        <Tabs defaultValue={pending.length > 0 ? "pending" : "farmer"}>
          <TabsList>
            <TabsTrigger value="pending">
              {t("admin.users.pending")}
              {pending.length > 0 ? ` (${pending.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="farmer">{t("common.farmers")}</TabsTrigger>
            <TabsTrigger value="trader">{t("common.traders")}</TabsTrigger>
            <TabsTrigger value="admin">{t("common.admins")}</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <UserTable users={pending} />
          </TabsContent>
          <TabsContent value="farmer" className="mt-4">
            <UserTable users={filtered.filter((u) => u.role === "farmer")} />
          </TabsContent>
          <TabsContent value="trader" className="mt-4">
            <UserTable users={filtered.filter((u) => u.role === "trader")} />
          </TabsContent>
          <TabsContent value="admin" className="mt-4">
            <UserTable users={filtered.filter((u) => u.role === "admin")} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
