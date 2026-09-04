"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { FilterPanel } from "@/components/shared/filter-panel";
import { formatDateTime } from "@/lib/format";
import { statusMessageKeys } from "@/lib/i18n/messages";
import { fetchLogs } from "@/lib/api";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import type { SystemLog } from "@/types";

export default function AdminLogsPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const [filters, setFilters] = useState<{ status?: string }>({});
  const { data: logs, loading } = useTokenQuery(
    token,
    async (authToken) =>
      (await fetchLogs(authToken, { type: filters.status })).logs,
    [] as SystemLog[],
    filters.status ?? ""
  );

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
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : logs.length === 0 ? (
        <EmptyState title={t("admin.logs.empty")} />
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="rounded-lg bg-card px-4 py-3 text-sm">
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
      )}
    </div>
  );
}
