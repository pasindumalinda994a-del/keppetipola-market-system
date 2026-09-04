"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ApiError,
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  updateAnnouncement,
} from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import type { Announcement } from "@/types";

export default function AdminAnnouncementsPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: items, setData: setItems, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchAnnouncements(authToken)).announcements,
    [] as Announcement[]
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);

  async function remove(id: string) {
    if (!token) return;
    try {
      await deleteAnnouncement(token, id);
      setItems((prev) => prev.filter((a) => a.id !== id));
      toast.message(t("admin.announcements.deleted"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  async function publish(id: string) {
    if (!token) return;
    try {
      const result = await updateAnnouncement(token, id, { status: "Published" });
      setItems((prev) =>
        prev.map((a) => (a.id === id ? result.announcement : a))
      );
      toast.success(t("admin.announcements.published"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  return (
    <div>
      <PageHeader
        title={t("admin.announcements.title")}
        description={t("admin.announcements.description")}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            {t("common.create")}
          </Button>
        }
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : items.length === 0 ? (
        <EmptyState
          title={t("admin.announcements.empty")}
          description={t("admin.announcements.emptyDescription")}
        />
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <article key={a.id} className="rounded-lg bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(a.publishedAt, locale)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(a);
                      setOpen(true);
                    }}
                  >
                    {t("common.edit")}
                  </Button>
                  {a.status !== "Published" ? (
                    <Button size="sm" onClick={() => void publish(a.id)}>
                      {t("common.publish")}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => void remove(a.id)}
                  >
                    {t("common.delete")}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("admin.announcements.edit")
                : t("admin.announcements.create")}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!token) return;
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title"));
              const body = String(fd.get("body"));
              setSaving(true);
              try {
                if (editing) {
                  const result = await updateAnnouncement(token, editing.id, {
                    title,
                    body,
                  });
                  setItems((prev) =>
                    prev.map((a) =>
                      a.id === editing.id ? result.announcement : a
                    )
                  );
                  toast.success(t("admin.announcements.updated"));
                } else {
                  const result = await createAnnouncement(token, { title, body });
                  setItems((prev) => [result.announcement, ...prev]);
                  toast.success(t("admin.announcements.draftCreated"));
                }
                setOpen(false);
              } catch (err) {
                toast.error(
                  err instanceof ApiError ? err.message : t("common.retry")
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="title">{t("common.title")}</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={editing?.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">{t("common.body")}</Label>
              <Textarea
                id="body"
                name="body"
                rows={4}
                required
                defaultValue={editing?.body}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
