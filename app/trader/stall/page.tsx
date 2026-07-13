"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stalls } from "@/lib/mock";

export default function StallProfilePage() {
  const stall = stalls[0];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Stall profile saved");
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Stall Profile"
        description="Public stall details farmers see on your requests."
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Stall name</Label>
          <Input id="name" defaultValue={stall.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" defaultValue={stall.location} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license">License</Label>
          <Input id="license" defaultValue={stall.license} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact</Label>
          <Input id="contact" defaultValue={stall.contact} />
        </div>
        <Button type="submit">Save stall</Button>
      </form>
    </div>
  );
}
