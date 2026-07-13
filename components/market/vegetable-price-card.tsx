import Link from "next/link";
import { formatLKR, formatRelativeTime } from "@/lib/format";
import type { MarketPrice } from "@/types";
import { PriceChange } from "@/components/shared/price-change";
import { cn } from "@/lib/utils";

export function VegetablePriceCard({
  price,
  href = "/prices",
  className,
}: {
  price: MarketPrice;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground">{price.vegetableName}</h3>
        <PriceChange value={price.change} />
      </div>
      <p className="mt-2 text-lg font-semibold text-price-foreground">
        {formatLKR(price.lowest)}–{formatLKR(price.highest)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Updated {formatRelativeTime(price.lastUpdated)}
      </p>
    </Link>
  );
}
