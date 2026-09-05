"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { ProducePicker } from "@/components/market/produce-picker";
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
import { ApiError, createHarvest } from "@/lib/api";
import {
  CompressError,
  prepareHarvestPhotos,
} from "@/lib/compress-image";
import { useVegetables } from "@/lib/hooks/use-vegetables";

export default function CreateHarvestPage() {
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
    const harvestDate = (form.elements.namedItem("harvestDate") as HTMLInputElement)
      .value;
    const expectedDelivery = (
      form.elements.namedItem("delivery") as HTMLInputElement
    ).value;
    const availableUntil = (form.elements.namedItem("until") as HTMLInputElement)
      .value;
    const photos = (form.elements.namedItem("photos") as HTMLInputElement)
      .files;

    const photoFiles = photos
      ? Array.from(photos).filter((file) => file.size > 0)
      : [];

    setPending(true);
    try {
      const compressed = photoFiles.length
        ? await prepareHarvestPhotos(photoFiles)
        : [];
      await createHarvest(token, {
        vegetableId: vegetable,
        quantityKg,
        qualityGrade: grade,
        harvestDate,
        expectedDelivery,
        availableUntil,
        photos: compressed,
      });
      toast.success(t("farmer.harvest.created"));
      router.push("/farmer/harvest");
    } catch (err) {
      toast.error(
        err instanceof ApiError || err instanceof CompressError
          ? err.message
          : t("common.retry")
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("farmer.harvest.newTitle")}
        description={t("farmer.harvest.newDescription")}
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
          <Label htmlFor="qty">{t("farmer.harvest.quantityKg")}</Label>
          <Input
            id="qty"
            name="qty"
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
            <Input id="harvestDate" name="harvestDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery">{t("farmer.harvest.expectedDelivery")}</Label>
            <Input id="delivery" name="delivery" type="date" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="until">{t("farmer.harvest.availableUntilLabel")}</Label>
          <Input id="until" name="until" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photos">{t("farmer.harvest.photos")}</Label>
          <Input id="photos" name="photos" type="file" accept="image/jpeg,image/png" multiple />
          <p className="text-xs text-muted-foreground">
            {t("farmer.harvest.photosHint")}
          </p>
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
