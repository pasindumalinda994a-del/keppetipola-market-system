"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMockUser } from "@/lib/mock-auth";

export default function FarmerProfilePage() {
  const user = getMockUser("farmer");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Profile saved");
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Profile"
        description="Personal information and contact details."
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" defaultValue={user.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" defaultValue={user.phone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={user.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" defaultValue={user.address} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank">Bank details (future)</Label>
          <Input id="bank" placeholder="Coming soon" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" placeholder="Leave blank to keep" />
        </div>
        <Button type="submit">Save profile</Button>
      </form>
    </div>
  );
}
