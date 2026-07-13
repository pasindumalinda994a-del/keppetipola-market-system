import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-semibold">Keppetipola Market</p>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Wholesale vegetable marketplace helping farmers find the best price
            for today&apos;s harvest.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link href="/prices" className="hover:text-primary-foreground">
                Live Prices
              </Link>
            </li>
            <li>
              <Link href="/demand" className="hover:text-primary-foreground">
                Market Demand
              </Link>
            </li>
            <li>
              <Link href="/trends" className="hover:text-primary-foreground">
                Price Trends
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Help</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link href="/about" className="hover:text-primary-foreground">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/about#faq" className="hover:text-primary-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 px-4 py-4 text-center text-xs text-primary-foreground/70">
        © {new Date().getFullYear()} Keppetipola Wholesale Market
      </div>
    </footer>
  );
}
