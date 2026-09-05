"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProduceCategoryFilter } from "@/components/market/produce-category-filter";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  createVegetable,
  fetchAllVegetables,
  fetchSettings,
  updateVegetable,
} from "@/lib/api";
import {
  translateProduceCategory,
  translateVegetableName,
} from "@/lib/i18n/messages";
import {
  DEFAULT_PRODUCE_CATEGORIES,
  filterProduceByCategory,
  parseProduceCategories,
} from "@/lib/produce";
import type { Vegetable } from "@/types";

export default function AdminVegetablesPage() {
  const { t } = useLocale();
  const { token } = useAuth();
  const [items, setItems] = useState<Vegetable[]>([]);
  const [categories, setCategories] = useState<string[]>(
    parseProduceCategories(DEFAULT_PRODUCE_CATEGORIES)
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState(categories[0] ?? "Vegetables");

  const visibleItems = useMemo(
    () => filterProduceByCategory(items, categoryFilter),
    [items, categoryFilter]
  );

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const [data, settingsData] = await Promise.all([
        fetchAllVegetables(token),
        fetchSettings(token).catch(() => ({
          settings: { vegetableCategories: "" },
        })),
      ]);
      setItems(data.vegetables);
      const nextCategories = parseProduceCategories(
        settingsData.settings.vegetableCategories
      );
      setCategories(nextCategories);
      setNewCategory((current) =>
        nextCategories.includes(current) ? current : nextCategories[0]
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : t("common.requestFailed")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function toggle(id: string, current: Vegetable["status"]) {
    if (!token) return;
    const next = current === "Active" ? "Inactive" : "Active";
    setSaving(true);
    try {
      await updateVegetable(token, id, { status: next });
      await load();
      toast.success(t("admin.vegetables.updated"));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : t("common.requestFailed")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t("admin.vegetables.title")}
        description={t("admin.vegetables.description")}
        action={
          <Button onClick={() => setOpen(true)}>
            {t("admin.vegetables.add")}
          </Button>
        }
      />
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <ProduceCategoryFilter
              value={categoryFilter}
              onChange={setCategoryFilter}
              categories={categories}
            />
          </div>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.category")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {translateVegetableName(v.name, t)}
                  </TableCell>
                  <TableCell>
                    {translateProduceCategory(v.category, t)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={() => toggle(v.id, v.status)}
                    >
                      {v.status === "Active"
                        ? t("common.disable")
                        : t("common.enable")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.vegetables.add")}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!token) return;
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") || "");
              const category = newCategory || "Vegetables";
              setSaving(true);
              try {
                await createVegetable(token, { name, category });
                await load();
                toast.success(t("admin.vegetables.added"));
                setOpen(false);
              } catch (err) {
                toast.error(
                  err instanceof ApiError
                    ? err.message
                    : t("common.requestFailed")
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label>{t("common.category")}</Label>
              <Select
                value={newCategory}
                onValueChange={(value) =>
                  setNewCategory(value ?? categories[0] ?? "Vegetables")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {translateProduceCategory(c, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? t("common.saving") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
