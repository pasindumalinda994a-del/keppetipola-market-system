import Image from "next/image";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 isolate" aria-hidden>
      <Image
        src="/images/hero-exchange.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 1152px) calc(100vw - 2rem), 1152px"
        className="object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/55 via-black/30 to-black/10" />
    </div>
  );
}
