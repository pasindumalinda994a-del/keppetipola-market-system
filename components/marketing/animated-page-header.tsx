"use client";

import { cn } from "@/lib/utils";
import SplitText from "@/components/marketing/split-text";

export function AnimatedPageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        <SplitText
          text={title}
          tag="h1"
          className="font-satoshi text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
        />
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
