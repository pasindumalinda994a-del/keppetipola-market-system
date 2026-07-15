"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setTimeout(() => {
      setPending(false);
      toast.success("Message sent. We’ll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Contact"
        description="Reach the market management office."
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={5} required />
          </div>
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Sending…" : "Send message"}
          </Button>
        </form>
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold">Phone</h2>
            <p className="mt-1 text-muted-foreground">+94 55 222 3344</p>
          </div>
          <div>
            <h2 className="font-semibold">Location</h2>
            <p className="mt-1 text-muted-foreground">
              Keppetipola Wholesale Vegetable Market
              <br />
              Badulla District, Sri Lanka
            </p>
          </div>
          <div>
            <h2 className="font-semibold">Market hours</h2>
            <p className="mt-1 text-muted-foreground">
              Daily 8:00 AM – 4:00 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
