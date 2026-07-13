import Link from "next/link";
import { Radio } from "lucide-react";
import { VegetablePriceCard } from "@/components/market/vegetable-price-card";
import { DemandRequestCard } from "@/components/market/demand-request-card";
import { StatCard } from "@/components/shared/stat-card";
import { SearchBar } from "@/components/shared/search-bar";
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
      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.94 0.04 145) 0%, oklch(0.98 0.01 90) 45%, oklch(0.93 0.05 75 / 0.45) 100%), radial-gradient(ellipse at 80% 20%, oklch(0.7 0.12 75 / 0.25), transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-[0.35]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232d5a3d' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-16">
          <p className="font-heading text-4xl font-semibold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Keppetipola Market
          </p>
          <h1 className="mt-4 max-w-xl text-xl font-medium text-foreground sm:text-2xl">
            Who will pay you the best price for your harvest today?
          </h1>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Live wholesale prices and trader demand — built for farmers first.
          </p>
          <form action="/prices" className="mt-8 max-w-xl">
            <label className="sr-only" htmlFor="home-search">
              Check Today&apos;s Vegetable Prices
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchBar
                name="q"
                placeholder="Check Today's Vegetable Prices"
                className="flex-1"
              />
              <Button type="submit" size="lg" className="h-11 shrink-0">
                Search prices
              </Button>
            </div>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-price text-price-foreground hover:bg-price/90">
              <Link href="/register">Register as Farmer</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register?role=trader">Register as Trader</Link>
            </Button>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1.5 text-xs font-medium text-primary">
              <Radio className="size-3.5 animate-pulse" />
              Live market open
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Today&apos;s Price Highlights
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Updated as traders buy and sell on the floor.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/prices">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {marketPrices.slice(0, 8).map((p) => (
            <VegetablePriceCard key={p.vegetableId} price={p} />
          ))}
        </div>
      </section>

      <section className="border-y bg-card/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Today&apos;s Market Demand
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Active buying requests from traders right now.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/demand">See demand</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {buyingRequests.slice(0, 3).map((r) => (
              <DemandRequestCard key={r.id} request={r} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">
          Market Statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Transactions"
            value={String(marketStats.todayTransactions)}
          />
          <StatCard
            title="Active Farmers"
            value={String(marketStats.activeFarmers)}
          />
          <StatCard
            title="Active Traders"
            value={String(marketStats.activeTraders)}
          />
          <StatCard
            title="Vegetables Sold"
            value={`${marketStats.vegetablesSoldTons} Tons`}
          />
        </div>
      </section>

      <section className="border-t bg-secondary/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Latest Announcements
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {announcements.map((a) => (
              <article key={a.id} className="rounded-xl border bg-card p-5">
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
