"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function FarmerSettingsPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Settings"
        description="Notifications and account preferences."
      />
      <div className="space-y-6 rounded-lg bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Offer alerts</Label>
            <p className="text-sm text-muted-foreground">
              Notify when traders send offers
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Price bookmarks</Label>
            <p className="text-sm text-muted-foreground">
              Daily digest for bookmarked vegetables
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Announcements</Label>
            <p className="text-sm text-muted-foreground">Market news and hours</p>
          </div>
          <Switch defaultChecked />
        </div>
        <Button
          onClick={() => toast.success("Settings saved")}
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}
