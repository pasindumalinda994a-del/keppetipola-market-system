"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterPanel } from "@/components/shared/filter-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { transactions } from "@/lib/mock";

export default function AdminTransactionsPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<{ status?: string }>({});

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchQ =
        !q ||
        t.id.toLowerCase().includes(q.toLowerCase()) ||
        t.farmerName.toLowerCase().includes(q.toLowerCase()) ||
        t.traderName.toLowerCase().includes(q.toLowerCase());
      const matchS = !filters.status || t.status === filters.status;
      return matchQ && matchS;
    });
  }, [q, filters]);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="All farmer–trader market transactions."
      />
      <div className="mb-6 space-y-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search ID or name…" />
        <FilterPanel
          statuses={["Pending", "Accepted", "Completed", "Cancelled"]}
          values={filters}
          onChange={setFilters}
        />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Trader</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                <TableCell>{t.farmerName}</TableCell>
                <TableCell>{t.traderName}</TableCell>
                <TableCell>
                  {t.vegetableName} · {formatKg(t.quantityKg)}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatLKR(t.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
                <TableCell>{formatDate(t.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
