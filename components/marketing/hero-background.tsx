import Image from "next/image";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 isolate" aria-hidden>
      <Image
        src="/images/hero-exchange.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/50 via-black/25 to-transparent" />
    </div>
  );
}
