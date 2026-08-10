"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { FilterPanel } from "@/components/shared/filter-panel";
import { formatDateTime } from "@/lib/format";
import { statusMessageKeys } from "@/lib/i18n/messages";
import { systemLogs } from "@/lib/mock";

export default function AdminLogsPage() {
  const { t, locale } = useLocale();
  const [filters, setFilters] = useState<{ status?: string }>({});

  const filtered = useMemo(() => {
    if (!filters.status) return systemLogs;
    return systemLogs.filter((l) => l.type === filters.status);
  }, [filters]);

  return (
    <div>
      <PageHeader
        title={t("admin.logs.title")}
        description={t("admin.logs.description")}
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
            className="rounded-lg bg-card px-4 py-3 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-primary">
                {statusMessageKeys[log.type]
                  ? t(statusMessageKeys[log.type])
                  : log.type}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(log.createdAt, locale)}
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
