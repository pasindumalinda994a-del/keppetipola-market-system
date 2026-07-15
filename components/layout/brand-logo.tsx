import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const logos = {
  default: {
    src: "/logo/keppetipola-market.png",
    width: 389,
    height: 106,
  },
  /** White wordmark — for dark chrome (footer). */
  onDark: {
    src: "/logo/keppetipola-market-on-dark.png",
    width: 395,
    height: 115,
  },
  /** Icon mark only — for dashboard. */
  mark: {
    src: "/logo/keppetipola-mark.png",
    width: 500,
    height: 500,
  },
} as const;

const sizeClass = {
  sm: "h-7",
  md: "h-8",
  lg: "h-10",
  xl: "h-12",
  hero: "h-14 sm:h-16 md:h-20",
} as const;

type BrandLogoProps = {
  /** Pass `null` to render without a link. */
  href?: string | null;
  className?: string;
  size?: keyof typeof sizeClass;
  variant?: keyof typeof logos;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  className,
  size = "md",
  variant = "default",
  priority = false,
}: BrandLogoProps) {
  const logo = logos[variant];
  const image = (
    <Image
      src={logo.src}
      alt="Keppetipola Market"
      width={logo.width}
      height={logo.height}
      priority={priority}
      className={cn("w-auto object-contain object-left", sizeClass[size])}
    />
  );

  if (href == null) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)}>
        {image}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center transition-opacity hover:opacity-90",
        className
      )}
    >
      {image}
    </Link>
  );
}
