"use client";

import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ApiError,
  createStall,
  fetchStalls,
  fetchUsers,
  updateStall,
} from "@/lib/api";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import type { Stall, User } from "@/types";

export default function AdminStallsPage() {
  const { t } = useLocale();
  const { token } = useAuth();
  const { data, setData, loading } = useTokenQuery(
    token,
    async (authToken) => {
      const [stallData, userData] = await Promise.all([
        fetchStalls(authToken),
        fetchUsers(authToken).catch(() => ({ users: [] as User[] })),
      ]);
      return { stalls: stallData.stalls, users: userData.users };
    },
    { stalls: [] as Stall[], users: [] as User[] }
  );
  const stalls = data.stalls;
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Stall | null>(null);
  const [traderId, setTraderId] = useState("");
  const [saving, setSaving] = useState(false);

  const stallTraderIds = useMemo(
    () => new Set(stalls.map((s) => s.traderId)),
    [stalls]
  );
  const eligibleTraders = data.users.filter(
    (u) =>
      u.role === "trader" &&
      u.status === "Active" &&
      !stallTraderIds.has(u.id)
  );
  const traderItems = Object.fromEntries(
    eligibleTraders.map((u) => [u.id, u.memberId ? `${u.name} (${u.memberId})` : u.name])
  );

  function replaceStall(next: Stall) {
    setData((prev) => ({
      ...prev,
      stalls: prev.stalls.map((s) => (s.id === next.id ? next : s)),
    }));
  }

  async function approve(id: string) {
    if (!token) return;
    try {
      const result = await updateStall(token, id, { status: "Active" });
      replaceStall(result.stall);
      toast.success(t("admin.stalls.approved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!traderId) {
      toast.error(t("admin.stalls.selectTraderToast"));
      return;
    }
    const form = e.currentTarget;
    setSaving(true);
    try {
      const result = await createStall(token, {
        traderId,
        name: (form.elements.namedItem("stallName") as HTMLInputElement).value,
        location: (form.elements.namedItem("loc") as HTMLInputElement).value,
        license: (form.elements.namedItem("license") as HTMLInputElement).value,
        contact: (form.elements.namedItem("contact") as HTMLInputElement).value,
      });
      setData((prev) => ({ ...prev, stalls: [result.stall, ...prev.stalls] }));
      toast.success(t("admin.stalls.added"));
      setAddOpen(false);
      setTraderId("");
      form.reset();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    } finally {
      setSaving(false);
    }
  }

  async function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !editing) return;
    const form = e.currentTarget;
    setSaving(true);
    try {
      const result = await updateStall(token, editing.id, {
        name: (form.elements.namedItem("editName") as HTMLInputElement).value,
        location: (form.elements.namedItem("editLocation") as HTMLInputElement)
          .value,
        license: (form.elements.namedItem("editLicense") as HTMLInputElement)
          .value,
        contact: (form.elements.namedItem("editContact") as HTMLInputElement)
          .value,
      });
      replaceStall(result.stall);
      toast.success(t("admin.stalls.updated"));
      setEditOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(stall: Stall) {
    if (!token) return;
    const next = stall.status === "Inactive" ? "Active" : "Inactive";
    try {
      const result = await updateStall(token, stall.id, { status: next });
      replaceStall(result.stall);
      toast.success(
        next === "Active"
          ? t("admin.stalls.reactivated")
          : t("admin.stalls.deactivated")
      );
      if (editing?.id === stall.id) {
        setEditing(result.stall);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  return (
    <div>
      <PageHeader
        title={t("admin.stalls.title")}
        description={t("admin.stalls.description")}
        action={
          <Button onClick={() => setAddOpen(true)}>{t("admin.stalls.add")}</Button>
        }
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : stalls.length === 0 ? (
        <EmptyState
          title={t("admin.stalls.empty")}
          description={t("admin.stalls.emptyDescription")}
        />
      ) : (
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.stalls.stall")}</TableHead>
                <TableHead>{t("common.trader")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stalls.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {s.name}
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  </TableCell>
                  <TableCell>{s.traderName}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    {s.status === "Pending" ? (
                      <Button size="sm" onClick={() => void approve(s.id)}>
                        {t("common.approve")}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(s);
                        setEditOpen(true);
                      }}
                    >
                      {t("common.edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) setTraderId("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.stalls.add")}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => void onCreate(e)}>
            <div className="space-y-2">
              <Label>{t("admin.stalls.selectTrader")}</Label>
              {eligibleTraders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("admin.stalls.noEligibleTraders")}
                </p>
              ) : (
                <Select
                  value={traderId || undefined}
                  onValueChange={(v) => setTraderId(v ?? "")}
                  items={traderItems}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("admin.stalls.selectTrader")} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleTraders.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.memberId ? `${u.name} (${u.memberId})` : u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stallName">{t("admin.stalls.name")}</Label>
              <Input id="stallName" name="stallName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">{t("common.location")}</Label>
              <Input id="loc" name="loc" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">{t("common.license")}</Label>
              <Input id="license" name="license" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">{t("common.contact")}</Label>
              <Input id="contact" name="contact" />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={saving || eligibleTraders.length === 0}
              >
                {t("admin.stalls.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.stalls.editTitle")}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form
              key={editing.id}
              className="space-y-4"
              onSubmit={(e) => void onEdit(e)}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{editing.traderName}</p>
                <StatusBadge status={editing.status} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editName">{t("admin.stalls.name")}</Label>
                <Input
                  id="editName"
                  name="editName"
                  defaultValue={editing.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLocation">{t("common.location")}</Label>
                <Input
                  id="editLocation"
                  name="editLocation"
                  defaultValue={editing.location}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLicense">{t("common.license")}</Label>
                <Input
                  id="editLicense"
                  name="editLicense"
                  defaultValue={editing.license}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContact">{t("common.contact")}</Label>
                <Input
                  id="editContact"
                  name="editContact"
                  defaultValue={editing.contact}
                />
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                {editing.status === "Inactive" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void toggleActive(editing)}
                  >
                    {t("admin.stalls.reactivate")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void toggleActive(editing)}
                  >
                    {t("admin.stalls.deactivate")}
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
