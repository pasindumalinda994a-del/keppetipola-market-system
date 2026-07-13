import Link from "next/link";
import { formatDateTime, formatKg, formatLKR } from "@/lib/format";
import type { BuyingRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DemandRequestCard({
  request,
  applyHref = "/login",
  className,
}: {
  request: BuyingRequest;
  applyHref?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-lg bg-card p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">Trader</p>
          <h3 className="font-semibold text-foreground">{request.traderName}</h3>
        </div>
        <span className="rounded-lg bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
          Grade {request.preferredGrade}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Needs</dt>
          <dd className="font-medium">
            {request.vegetableName} · {formatKg(request.quantityKg)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Offering</dt>
          <dd className="font-semibold text-price-foreground">
            {formatLKR(request.minPrice)}–{formatLKR(request.maxPrice)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Closes</dt>
          <dd className="font-medium">{formatDateTime(request.closingTime)}</dd>
        </div>
      </dl>
      <Button asChild className="mt-4 w-full">
        <Link href={applyHref}>Apply</Link>
      </Button>
    </article>
  );
}
