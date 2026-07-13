"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { users } from "@/lib/mock";
import type { UserRole } from "@/types";

function UserTable({ role }: { role: UserRole }) {
  const rows = users.filter((u) => u.role === role);
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="capitalize">{u.role}</TableCell>
              <TableCell>
                <StatusBadge status={u.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/users/${u.id}`}>View</Link>
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
        title="User Management"
        description={`${filteredCount} users in the marketplace.`}
      />
      <SearchBar
        className="mb-6 max-w-sm"
        value={q}
        onChange={setQ}
        placeholder="Search users…"
      />
      <Tabs defaultValue="farmer">
        <TabsList>
          <TabsTrigger value="farmer">Farmers</TabsTrigger>
          <TabsTrigger value="trader">Traders</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
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
