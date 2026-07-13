import { cn } from "@/lib/utils";
import type { Status } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-900 border-amber-200",
  Offered: "bg-sky-100 text-sky-900 border-sky-200",
  Accepted: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Completed: "bg-primary/15 text-primary border-primary/20",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
  Active: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Closed: "bg-muted text-muted-foreground border-border",
  Published: "bg-primary/15 text-primary border-primary/20",
  Draft: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status], className)}
    >
      {status}
    </Badge>
  );
}
