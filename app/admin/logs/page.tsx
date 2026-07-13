"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterPanel } from "@/components/shared/filter-panel";
import { formatDateTime } from "@/lib/format";
import { systemLogs } from "@/lib/mock";

export default function AdminLogsPage() {
  const [filters, setFilters] = useState<{ status?: string }>({});

  const filtered = useMemo(() => {
    if (!filters.status) return systemLogs;
    return systemLogs.filter((l) => l.type === filters.status);
  }, [filters]);

  return (
    <div>
      <PageHeader
        title="System Logs"
        description="Login, price updates, transactions, and errors."
      />
      <div className="mb-6">
        <FilterPanel
          statuses={["Login", "Price Update", "Transaction", "Error"]}
          values={filters}
          onChange={setFilters}
        />
      </div>
      <ul className="space-y-2">
        {filtered.map((log) => (
          <li
            key={log.id}
            className="rounded-lg border bg-card px-4 py-3 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-primary">{log.type}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">{log.message}</p>
            {log.user ? (
              <p className="mt-1 text-xs text-muted-foreground">{log.user}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
