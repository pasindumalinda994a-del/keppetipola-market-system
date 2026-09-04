"use client";

import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  deleteContactMessage,
  fetchContactMessages,
  markContactRead,
} from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import type { ContactMessage } from "@/types";

export default function AdminContactPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: messages, setData, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchContactMessages(authToken)).messages,
    [] as ContactMessage[]
  );

  async function markRead(id: string) {
    if (!token) return;
    try {
      const result = await markContactRead(token, id);
      setData((prev) => prev.map((m) => (m.id === id ? result.message : m)));
      toast.success(t("admin.contact.markedRead"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  async function remove(id: string) {
    if (!token) return;
    try {
      await deleteContactMessage(token, id);
      setData((prev) => prev.filter((m) => m.id !== id));
      toast.message(t("admin.contact.deleted"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  return (
    <div>
      <PageHeader
        title={t("admin.contact.title")}
        description={t("admin.contact.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : messages.length === 0 ? (
        <EmptyState
          title={t("admin.contact.empty")}
          description={t("admin.contact.emptyDescription")}
        />
      ) : (
        <ul className="space-y-3">
          {messages.map((item) => (
            <li key={item.id} className="rounded-lg bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    {!item.read ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                        {t("common.unread")}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt, locale)}
                  </p>
                  <p className="mt-3 text-sm">{item.message}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!item.read ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void markRead(item.id)}
                    >
                      {t("common.markRead")}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => void remove(item.id)}
                  >
                    {t("common.delete")}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
