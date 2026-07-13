"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function TraderSettingsPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Settings" description="Trader notification preferences." />
      <div className="space-y-6 rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>New applications</Label>
            <p className="text-sm text-muted-foreground">
              Alert when farmers apply to your requests
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Accepted offers</Label>
            <p className="text-sm text-muted-foreground">
              When a farmer accepts your offer
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Button onClick={() => toast.success("Settings saved")}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
