import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar({
  placeholder = "Search…",
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
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 pl-9"
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </div>
  );
}
