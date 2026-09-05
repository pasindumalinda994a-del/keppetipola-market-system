"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserAvatar({
  name,
  src,
  className,
  size = "default",
  fallbackClassName,
}: {
  name: string;
  src?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  fallbackClassName?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback className={cn(fallbackClassName)}>
        {initials(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
