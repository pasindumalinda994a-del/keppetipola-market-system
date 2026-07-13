"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { vegetables } from "@/lib/mock";

export default function CreateHarvestPage() {
  const router = useRouter();
  const [vegetable, setVegetable] = useState("");
  const [grade, setGrade] = useState("A");
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vegetable) {
      toast.error("Select a vegetable");
      return;
    }
    setPending(true);
    setTimeout(() => {
      toast.success("Harvest listing created");
      router.push("/farmer/harvest");
    }, 500);
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Create Harvest Listing"
        description="List what you have today — traders can find you in under a minute."
      />
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg bg-card p-6"
      >
        <div className="space-y-2">
          <Label>Vegetable</Label>
          <Select
            value={vegetable || undefined}
            onValueChange={(v) => setVegetable(v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select vegetable" />
            </SelectTrigger>
            <SelectContent>
              {vegetables.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">Quantity (kg)</Label>
          <Input id="qty" type="number" min={1} required placeholder="e.g. 400" />
        </div>
        <div className="space-y-2">
          <Label>Quality Grade</Label>
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
            <Label htmlFor="harvestDate">Harvest Date</Label>
            <Input id="harvestDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery">Expected Delivery</Label>
            <Input id="delivery" type="date" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="until">Available Until</Label>
          <Input id="until" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photos">Photos (optional)</Label>
          <Input id="photos" type="file" accept="image/*" multiple />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Submitting…" : "Submit listing"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/farmer/harvest">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
