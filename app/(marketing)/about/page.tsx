import { PageHeader } from "@/components/shared/page-header";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="About Keppetipola Market"
        description="A marketplace for farmers and traders at Sri Lanka’s highland wholesale hub."
      />
      <div className="prose prose-neutral max-w-none space-y-4 text-muted-foreground">
        <p className="text-foreground">
          Keppetipola Market connects farmers with traders who are buying today —
          so you can see who is paying the best price for your harvest before you
          haul it to the yard.
        </p>
        <p>
          We publish live wholesale prices, active buying requests, and simple
          tools to list harvest, compare offers, and close sales — without the
          noise of a traditional ERP.
        </p>
        <h2 id="faq" className="pt-6 text-xl font-semibold text-foreground">
          FAQ
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground">Is this free for farmers?</h3>
            <p className="mt-1 text-sm">
              Browsing prices and demand is free. Listing harvest and receiving
              offers is included for registered farmers.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">How often do prices update?</h3>
            <p className="mt-1 text-sm">
              Prices refresh from completed deals and trader activity throughout
              the trading day.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Do I need to visit the market?</h3>
            <p className="mt-1 text-sm">
              Pickup and delivery are arranged between you and the trader. Many
              deals still settle at the physical stalls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
