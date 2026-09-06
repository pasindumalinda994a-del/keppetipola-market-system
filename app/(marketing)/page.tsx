import Image from "next/image";
import Link from "next/link";
import { HeroBackground } from "@/components/marketing/hero-background";
import { HomePriceHighlights } from "@/components/marketing/home-price-highlights";
import SplitText from "@/components/marketing/split-text";
import { MarketDemandHighlights } from "@/components/market/market-demand-highlights";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { listPublishedAnnouncements } from "@/lib/actions/announcement.actions";
import { getMarketStats } from "@/lib/actions/stats.actions";
import { formatDate } from "@/lib/format";
import connectDB from "@/lib/mongodb";

export default async function HomePage() {
  await connectDB();
  const [announcements, marketStats] = await Promise.all([
    listPublishedAnnouncements(3),
    getMarketStats(),
  ]);
  return (
    <div>
      <section className="relative isolate min-h-dvh overflow-hidden border-b">
        <HeroBackground />
        <div className="relative z-20 mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-4 py-16">
          <div>
            <SplitText
              text="Keppetipola Market System"
              tag="h1"
              className="font-satoshi max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl"
            />
            <h2 className="font-satoshi mt-6 max-w-xl text-xl font-medium text-white/90 sm:text-2xl">
              Who will pay you the best price for your harvest today?
            </h2>
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
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
        </div>
      </section>

      <HomePriceHighlights />

      <MarketDemandHighlights />

      <section className="relative isolate overflow-hidden border-y py-14">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <Image
            src="/images/market-statistics.jpeg"
            alt=""
            fill
            sizes="100vw"
            className="scale-110 object-cover object-center blur-md"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <SplitText
            text="Market Statistics"
            tag="h2"
            className="font-satoshi mb-6 text-2xl font-semibold tracking-tight text-white"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Today's Transactions"
              value={String(marketStats.todayTransactions.value)}
              change={marketStats.todayTransactions.change}
              changeLabel="vs yesterday"
              chartData={marketStats.todayTransactions.chartData}
            />
            <StatCard
              title="Active Farmers"
              value={String(marketStats.activeFarmers.value)}
              change={marketStats.activeFarmers.change}
              changeLabel="vs yesterday"
              chartData={marketStats.activeFarmers.chartData}
            />
            <StatCard
              title="Active Traders"
              value={String(marketStats.activeTraders.value)}
              change={marketStats.activeTraders.change}
              changeLabel="vs yesterday"
              chartData={marketStats.activeTraders.chartData}
            />
            <StatCard
              title="Produce Sold"
              value={`${marketStats.vegetablesSoldTons.value} Tons`}
              change={marketStats.vegetablesSoldTons.change}
              changeLabel="vs yesterday"
              chartData={marketStats.vegetablesSoldTons.chartData}
            />
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/60 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <SplitText
            text="Latest Announcements"
            tag="h2"
            className="font-satoshi mb-6 text-2xl font-semibold tracking-tight"
          />
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No announcements right now.
            </p>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
}
