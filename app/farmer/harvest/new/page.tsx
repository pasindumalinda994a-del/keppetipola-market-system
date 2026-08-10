"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { translateVegetableName } from "@/lib/i18n/messages";
import { vegetables } from "@/lib/mock";

export default function CreateHarvestPage() {
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
      toast.success(t("farmer.harvest.created"));
      router.push("/farmer/harvest");
    }, 500);
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("farmer.harvest.newTitle")}
        description={t("farmer.harvest.newDescription")}
      />
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg bg-card p-6"
      >
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
          <Label htmlFor="qty">{t("farmer.harvest.quantityKg")}</Label>
          <Input
            id="qty"
            type="number"
            min={1}
            required
            placeholder={t("farmer.harvest.quantityPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("farmer.harvest.qualityGrade")}</Label>
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
            <Label htmlFor="harvestDate">{t("common.harvestDate")}</Label>
            <Input id="harvestDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery">{t("farmer.harvest.expectedDelivery")}</Label>
            <Input id="delivery" type="date" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="until">{t("farmer.harvest.availableUntilLabel")}</Label>
          <Input id="until" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photos">{t("farmer.harvest.photos")}</Label>
          <Input id="photos" type="file" accept="image/*" multiple />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? t("common.submitting") : t("farmer.harvest.submit")}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/farmer/harvest">{t("common.cancel")}</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
