import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PriceChange({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const up = value > 0;
  const down = value < 0;
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-sm font-medium",
        up && "text-success",
        down && "text-destructive",
        !up && !down && "text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3.5" />
      {up ? "+" : ""}
      {value}
    </span>
  );
}
