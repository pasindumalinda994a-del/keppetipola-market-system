"use client";

import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { formatLKR, formatRelativeTime } from "@/lib/format";
import type { MarketPrice } from "@/types";
import { PriceChange } from "@/components/shared/price-change";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";
import { fillTemplate, translateProduceCategory, translateVegetableName } from "@/lib/i18n/messages";

export function VegetablePriceCard({
  price,
  href,
  className,
  variant = "default",
}: {
  price: MarketPrice;
  href?: string;
  className?: string;
  variant?: "default" | "guest";
}) {
  const { t, locale } = useLocale();
  const vegName = translateVegetableName(price.vegetableName, t);
  const content = (
    <>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {price.imageUrl ? (
          <Image
            src={price.imageUrl}
            alt={vegName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Leaf className="size-10 opacity-40" aria-hidden />
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{vegName}</h3>
          <PriceChange value={price.change} />
        </div>
        {price.category ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {translateProduceCategory(price.category, t)}
          </p>
        ) : null}
        <p className="mt-1.5 text-lg font-semibold text-price-foreground">
          {formatLKR(price.lowest, locale)}–{formatLKR(price.highest, locale)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {fillTemplate(t("time.updated"), {
            time: formatRelativeTime(price.lastUpdated, locale),
          })}
        </p>
      </div>
    </>
  );

  const classes = cn(
    variant === "guest"
      ? "guest-card group block p-3 transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.1)]"
      : "group block rounded-xl bg-card p-3 transition-colors hover:bg-accent/30",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
