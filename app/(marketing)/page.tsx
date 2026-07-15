import Link from "next/link";
import { HeroSlider } from "@/components/marketing/hero-slider";
import { PriceHighlights } from "@/components/market/price-highlights";
import { MarketDemandHighlights } from "@/components/market/market-demand-highlights";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  announcements,
  buyingRequests,
  marketPrices,
  marketStats,
} from "@/lib/mock";
import { formatDate } from "@/lib/format";

export default function HomePage() {
  return (
    <div>
      <section className="relative isolate min-h-dvh overflow-hidden border-b">
        <HeroSlider />
        <div className="relative z-20 mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-4 py-16">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <h1 className="font-satoshi max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
              Keppetipola Market System
            </h1>
            <h2 className="font-satoshi mt-6 max-w-xl text-xl font-medium text-white/90 sm:text-2xl">
              Who will pay you the best price for your harvest today?
            </h2>
            <p className="mt-3 max-w-lg text-white/75">
              Live wholesale prices and trader demand — built for farmers first.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/register?role=farmer">Register as Farmer</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/register?role=trader">Register as Trader</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PriceHighlights prices={marketPrices} />

      <MarketDemandHighlights requests={buyingRequests} />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-satoshi mb-6 text-2xl font-semibold tracking-tight">
          Market Statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Transactions"
            value={String(marketStats.todayTransactions)}
            change={5.4}
            chartData={[4, 6, 5, 7, 8]}
          />
          <StatCard
            title="Active Farmers"
            value={String(marketStats.activeFarmers)}
            change={3.2}
            chartData={[5, 5, 6, 7, 8]}
          />
          <StatCard
            title="Active Traders"
            value={String(marketStats.activeTraders)}
            change={-1.5}
            chartData={[7, 6, 5, 4, 4]}
          />
          <StatCard
            title="Vegetables Sold"
            value={`${marketStats.vegetablesSoldTons} Tons`}
            change={8.1}
            chartData={[3, 5, 4, 7, 9]}
          />
        </div>
      </section>

      <section className="border-t bg-muted/60 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-satoshi mb-6 text-2xl font-semibold tracking-tight">
            Latest Announcements
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {announcements.map((a) => (
              <article key={a.id} className="rounded-xl bg-card p-5">
                <p className="text-xs text-muted-foreground">
                  {formatDate(a.publishedAt)}
                </p>
                <h3 className="mt-2 font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
