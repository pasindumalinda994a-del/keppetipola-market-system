"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useLocale } from "@/components/providers/locale-provider";
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
import { translateVegetableName } from "@/lib/i18n/messages";
import { vegetables } from "@/lib/mock";

export default function CreateBuyingRequestPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [vegetable, setVegetable] = useState("");
  const [grade, setGrade] = useState("A");
  const [pending, setPending] = useState(false);

  const vegetableItems = Object.fromEntries(
    vegetables.map((v) => [v.id, translateVegetableName(v.name, t)])
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vegetable) {
      toast.error(t("common.selectVegetableToast"));
      return;
    }
    setPending(true);
    setTimeout(() => {
      toast.success(t("trader.requests.published"));
      router.push("/trader/requests");
    }, 500);
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("trader.requests.newTitle")}
        description={t("trader.requests.newDescription")}
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-card p-6">
        <div className="space-y-2">
          <Label>{t("common.vegetable")}</Label>
          <Select
            value={vegetable || undefined}
            onValueChange={(v) => setVegetable(v ?? "")}
            items={vegetableItems}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("common.selectVegetable")} />
            </SelectTrigger>
            <SelectContent>
              {vegetables.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {translateVegetableName(v.name, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">{t("trader.requests.quantityNeeded")}</Label>
          <Input id="qty" type="number" min={1} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="min">{t("trader.requests.minPrice")}</Label>
            <Input id="min" type="number" min={1} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">{t("trader.requests.maxPrice")}</Label>
            <Input id="max" type="number" min={1} required />
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
            <Input id="pickup" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing">{t("trader.requests.closingTime")}</Label>
            <Input id="closing" type="datetime-local" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">{t("common.notes")}</Label>
          <Textarea
            id="notes"
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
