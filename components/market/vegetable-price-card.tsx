import Image from "next/image";
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
        "group block rounded-xl border border-border/70 bg-card p-3 shadow-sm transition-colors hover:border-primary/35 hover:bg-accent/30",
        className
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-muted">
        <Image
          src={price.imageUrl}
          alt={price.vegetableName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{price.vegetableName}</h3>
          <PriceChange value={price.change} />
        </div>
        <p className="mt-1.5 text-lg font-semibold text-price-foreground">
          {formatLKR(price.lowest)}–{formatLKR(price.highest)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Updated {formatRelativeTime(price.lastUpdated)}
        </p>
      </div>
    </Link>
  );
}
