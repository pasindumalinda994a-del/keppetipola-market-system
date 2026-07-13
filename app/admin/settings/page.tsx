"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  function save(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Settings"
        description="Categories, market hours, and notification templates."
      />
      <form onSubmit={save} className="space-y-8 rounded-xl border bg-card p-6">
        <section className="space-y-4">
          <h2 className="font-semibold">Categories</h2>
          <div className="space-y-2">
            <Label htmlFor="categories">Vegetable categories</Label>
            <Input
              id="categories"
              defaultValue="Root, Leafy, Pod, Fruit"
            />
          </div>
        </section>
        <Separator />
        <section className="space-y-4">
          <h2 className="font-semibold">Market open hours</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="open">Opens</Label>
              <Input id="open" type="time" defaultValue="04:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="close">Closes</Label>
              <Input id="close" type="time" defaultValue="14:00" />
            </div>
          </div>
        </section>
        <Separator />
        <section className="space-y-4">
          <h2 className="font-semibold">System configuration</h2>
          <div className="space-y-2">
            <Label htmlFor="marketName">Market display name</Label>
            <Input id="marketName" defaultValue="Keppetipola Market" />
          </div>
        </section>
        <Separator />
        <section className="space-y-4">
          <h2 className="font-semibold">Notification templates</h2>
          <div className="space-y-2">
            <Label htmlFor="offerTpl">New offer template</Label>
            <Textarea
              id="offerTpl"
              rows={3}
              defaultValue="{{trader}} offered Rs.{{price}}/kg for your {{vegetable}} listing."
            />
          </div>
        </section>
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
