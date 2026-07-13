"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
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
import { vegetables } from "@/lib/mock";

export default function CreateBuyingRequestPage() {
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
      toast.success("Buying request published");
      router.push("/trader/requests");
    }, 500);
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Create Buying Request"
        description="Tell farmers what you need and the price you’ll pay."
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-6">
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
          <Label htmlFor="qty">Quantity needed (kg)</Label>
          <Input id="qty" type="number" min={1} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="min">Minimum price</Label>
            <Input id="min" type="number" min={1} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">Maximum price</Label>
            <Input id="max" type="number" min={1} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Preferred grade</Label>
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
            <Label htmlFor="pickup">Pickup date</Label>
            <Input id="pickup" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing">Closing time</Label>
            <Input id="closing" type="datetime-local" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={3} placeholder="Optional notes for farmers" />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Publishing…" : "Submit"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/trader/requests">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
