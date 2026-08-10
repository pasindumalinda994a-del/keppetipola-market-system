"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
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
import { translateVegetableName } from "@/lib/i18n/messages";
import { transactions } from "@/lib/mock";

export default function AdminTransactionsPage() {
  const { t, locale } = useLocale();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<{ status?: string }>({});

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchQ =
        !q ||
        txn.id.toLowerCase().includes(q.toLowerCase()) ||
        txn.farmerName.toLowerCase().includes(q.toLowerCase()) ||
        txn.traderName.toLowerCase().includes(q.toLowerCase());
      const matchS = !filters.status || txn.status === filters.status;
      return matchQ && matchS;
    });
  }, [q, filters]);

  return (
    <div>
      <PageHeader
        title={t("admin.transactions.title")}
        description={t("admin.transactions.description")}
      />
      <div className="mb-6 space-y-4">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={t("search.idOrName")}
        />
        <FilterPanel
          statuses={["Pending", "Accepted", "Completed", "Cancelled"]}
          values={filters}
          onChange={setFilters}
        />
      </div>
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.transactions.id")}</TableHead>
              <TableHead>{t("common.farmer")}</TableHead>
              <TableHead>{t("common.trader")}</TableHead>
              <TableHead>{t("common.qty")}</TableHead>
              <TableHead>{t("common.amount")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("common.date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-mono text-xs">{txn.id}</TableCell>
                <TableCell>{txn.farmerName}</TableCell>
                <TableCell>{txn.traderName}</TableCell>
                <TableCell>
                  {translateVegetableName(txn.vegetableName, t)} ·{" "}
                  {formatKg(txn.quantityKg, locale)}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatLKR(txn.amount, locale)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={txn.status} />
                </TableCell>
                <TableCell>{formatDate(txn.date, locale)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
