"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const HOLD_SECONDS = 4;
const FADE_SECONDS = 1;

const slides = [
  {
    src: "/images/hero-image-1.jpg",
    alt: "Fresh vegetables at Keppetipola wholesale market",
  },
  {
    src: "/images/hero-image-2.jpg",
    alt: "Produce displays at Keppetipola wholesale market",
  },
  {
    src: "/images/hero-image-3.jpg",
    alt: "Wholesale vegetable stalls at Keppetipola market",
  },
] as const;

export function HeroSlider() {
  const rootRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const slidesEl = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slidesEl.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || slidesEl.length === 1) {
      slidesEl.forEach((el, i) => {
        gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 });
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(slidesEl, { autoAlpha: 0, zIndex: 0 });
      gsap.set(slidesEl[0], { autoAlpha: 1, zIndex: 1 });

      const tl = gsap.timeline({ repeat: -1 });

      for (let i = 0; i < slidesEl.length; i++) {
        const current = slidesEl[i];
        const next = slidesEl[(i + 1) % slidesEl.length];

        tl.to({}, { duration: HOLD_SECONDS });
        tl.set(next, { zIndex: 2, autoAlpha: 0 });
        tl.set(current, { zIndex: 1 });
        tl.to(next, { autoAlpha: 1, duration: FADE_SECONDS, ease: "power1.inOut" });
        tl.set(current, { autoAlpha: 0, zIndex: 0 });
        tl.set(next, { zIndex: 1 });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0 z-0 isolate" aria-hidden>
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          ref={(el) => {
            slideRefs.current[index] = el;
          }}
          className="absolute inset-0"
          style={{
            opacity: index === 0 ? 1 : 0,
            zIndex: index === 0 ? 1 : 0,
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black/55" />
    </div>
  );
}
