"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { ProducePicker } from "@/components/market/produce-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, createBuyingRequest } from "@/lib/api";
import { useVegetables } from "@/lib/hooks/use-vegetables";

export default function CreateBuyingRequestPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { token } = useAuth();
  const { vegetables, loading } = useVegetables();
  const [vegetable, setVegetable] = useState("");
  const [grade, setGrade] = useState("A");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!vegetable) {
      toast.error(t("common.selectVegetableToast"));
      return;
    }
    const form = e.currentTarget;
    const quantityKg = Number(
      (form.elements.namedItem("qty") as HTMLInputElement).value
    );
    const minPrice = Number(
      (form.elements.namedItem("min") as HTMLInputElement).value
    );
    const maxPrice = Number(
      (form.elements.namedItem("max") as HTMLInputElement).value
    );
    const pickupDate = (form.elements.namedItem("pickup") as HTMLInputElement)
      .value;
    const closingTime = (form.elements.namedItem("closing") as HTMLInputElement)
      .value;
    const notes = (form.elements.namedItem("notes") as HTMLTextAreaElement)
      .value;

    setPending(true);
    try {
      await createBuyingRequest(token, {
        vegetableId: vegetable,
        quantityKg,
        minPrice,
        maxPrice,
        preferredGrade: grade,
        pickupDate,
        closingTime,
        notes: notes || undefined,
      });
      toast.success(t("trader.requests.published"));
      router.push("/trader/requests");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("trader.requests.newTitle")}
        description={t("trader.requests.newDescription")}
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-card p-6">
        <ProducePicker
          vegetables={vegetables}
          value={vegetable}
          onChange={setVegetable}
          loading={loading}
          disabled={pending}
        />
        <div className="space-y-2">
          <Label htmlFor="qty">{t("trader.requests.quantityNeeded")}</Label>
          <Input id="qty" name="qty" type="number" min={1} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="min">{t("trader.requests.minPrice")}</Label>
            <Input id="min" name="min" type="number" min={1} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">{t("trader.requests.maxPrice")}</Label>
            <Input id="max" name="max" type="number" min={1} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("trader.requests.preferredGrade")}</Label>
          <Select value={grade} onValueChange={(v) => setGrade(v ?? "A")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pickup">{t("trader.requests.pickupDate")}</Label>
            <Input id="pickup" name="pickup" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing">{t("trader.requests.closingTime")}</Label>
            <Input id="closing" name="closing" type="datetime-local" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">{t("common.notes")}</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder={t("trader.requests.notesPlaceholder")}
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? t("common.publishing") : t("common.submit")}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/trader/requests">{t("common.cancel")}</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
