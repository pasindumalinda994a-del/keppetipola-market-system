"use client";

import Link from "next/link";
import { formatDateTime, formatKg, formatLKR } from "@/lib/format";
import type { BuyingRequest } from "@/types";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";
import { fillTemplate, translateVegetableName } from "@/lib/i18n/messages";

export function DemandRequestCard({
  request,
  applyHref = "/login",
  className,
}: {
  request: BuyingRequest;
  applyHref?: string;
  className?: string;
}) {
  const { t, locale } = useLocale();
  return (
    <article
      className={cn(
        "flex flex-col rounded-lg bg-card p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            name={request.traderName}
            src={request.traderPhotoUrl}
            size="lg"
            className="size-11"
          />
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{t("common.trader")}</p>
            <h3 className="truncate font-semibold text-foreground">
              {request.traderName}
            </h3>
          </div>
        </div>
        <span className="shrink-0 rounded-lg bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
          {fillTemplate(t("common.gradeLabel"), { grade: request.preferredGrade })}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{t("demand.needs")}</dt>
          <dd className="font-medium">
            {translateVegetableName(request.vegetableName, t)} ·{" "}
            {formatKg(request.quantityKg, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("demand.offering")}</dt>
          <dd className="font-semibold text-price-foreground">
            {formatLKR(request.minPrice, locale)}–{formatLKR(request.maxPrice, locale)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">{t("demand.closes")}</dt>
          <dd className="font-medium">
            {formatDateTime(request.closingTime, locale)}
          </dd>
        </div>
      </dl>
      <Button asChild className="mt-4 w-full">
        <Link href={applyHref}>{t("common.apply")}</Link>
      </Button>
    </article>
  );
}
