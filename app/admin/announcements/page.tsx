"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { formatDate } from "@/lib/format";
import { announcements as seed } from "@/lib/mock";
import type { Announcement } from "@/types";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>(seed);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  function remove(id: string) {
    setItems((prev) => prev.filter((a) => a.id !== id));
    toast.message("Announcement deleted");
  }

  function publish(id: string) {
    setItems((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "Published" } : a
      )
    );
    toast.success("Published");
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Create and publish market announcements."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Create
          </Button>
        }
      />
      <div className="space-y-4">
        {items.map((a) => (
          <article key={a.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{a.title}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(a.publishedAt)}
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
                  Edit
                </Button>
                {a.status !== "Published" ? (
                  <Button size="sm" onClick={() => publish(a.id)}>
                    Publish
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => remove(a.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit announcement" : "Create announcement"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title"));
              const body = String(fd.get("body"));
              if (editing) {
                setItems((prev) =>
                  prev.map((a) =>
                    a.id === editing.id ? { ...a, title, body } : a
                  )
                );
                toast.success("Announcement updated");
              } else {
                setItems((prev) => [
                  {
                    id: `ann-${Date.now()}`,
                    title,
                    body,
                    publishedAt: new Date().toISOString(),
                    status: "Draft",
                  },
                  ...prev,
                ]);
                toast.success("Draft created");
              }
              setOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={editing?.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                name="body"
                rows={4}
                required
                defaultValue={editing?.body}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
