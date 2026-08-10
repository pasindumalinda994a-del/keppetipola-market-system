"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";

export function SearchBar({
  placeholder,
  value,
  onChange,
  className,
  name = "q",
  defaultValue,
}: {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  name?: string;
}) {
  const { t } = useLocale();
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder ?? t("search.default")}
        className="h-11 pl-9"
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </div>
  );
}
