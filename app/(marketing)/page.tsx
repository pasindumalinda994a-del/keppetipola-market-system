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
      <section className="bg-background py-5 sm:py-8">
        <div className="guest-wrap">
          <div className="relative isolate min-h-[34rem] overflow-hidden rounded-2xl sm:min-h-[40rem]">
            <HeroBackground />
            <div className="relative z-20 flex min-h-[34rem] flex-col justify-center px-6 py-12 sm:min-h-[40rem] sm:px-12">
              <div>
                <SplitText
                  text="Keppetipola Market System"
                  tag="h1"
                  className="font-satoshi max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
                />
                <p className="font-satoshi mt-5 max-w-xl text-lg font-medium text-white/90 sm:text-2xl">
                  Who will pay you the best price for your harvest today?
                </p>
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                  <p className="mt-3 max-w-lg text-white/75">
                    Live wholesale prices and trader demand — built for farmers
                    first.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button asChild size="lg" variant="brand" className="h-11 px-6">
                      <Link href="/register?role=farmer">Register as Farmer</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-11 rounded-full border-white/50 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white"
                    >
                      <Link href="/register?role=trader">Register as Trader</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomePriceHighlights />

      <MarketDemandHighlights />

      <section className="py-14">
        <div className="guest-wrap">
          <SplitText
            text="Market Statistics"
            tag="h2"
            className="font-satoshi mb-6 text-xl font-bold tracking-tight sm:text-2xl"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Today's Transactions"
              value={String(marketStats.todayTransactions.value)}
              change={marketStats.todayTransactions.change}
              changeLabel="vs yesterday"
              chartData={marketStats.todayTransactions.chartData}
              className="guest-card rounded-xl shadow-none"
            />
            <StatCard
              title="Active Farmers"
              value={String(marketStats.activeFarmers.value)}
              change={marketStats.activeFarmers.change}
              changeLabel="vs yesterday"
              chartData={marketStats.activeFarmers.chartData}
              className="guest-card rounded-xl shadow-none"
            />
            <StatCard
              title="Active Traders"
              value={String(marketStats.activeTraders.value)}
              change={marketStats.activeTraders.change}
              changeLabel="vs yesterday"
              chartData={marketStats.activeTraders.chartData}
              className="guest-card rounded-xl shadow-none"
            />
            <StatCard
              title="Produce Sold"
              value={`${marketStats.vegetablesSoldTons.value} Tons`}
              change={marketStats.vegetablesSoldTons.change}
              changeLabel="vs yesterday"
              chartData={marketStats.vegetablesSoldTons.chartData}
              className="guest-card rounded-xl shadow-none"
            />
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="guest-wrap">
          <SplitText
            text="Latest Announcements"
            tag="h2"
            className="font-satoshi mb-6 text-xl font-bold tracking-tight sm:text-2xl"
          />
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No announcements right now.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {announcements.map((a) => (
                <article
                  key={a.id}
                  className="guest-card border-l-4 border-l-primary p-5"
                >
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
