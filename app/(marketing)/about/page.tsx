import { AnimatedPageHeader } from "@/components/marketing/animated-page-header";

export default function AboutPage() {
  return (
    <div className="guest-wrap py-10">
      <AnimatedPageHeader
        title="About Keppetipola Market"
        description="A marketplace for farmers and traders at Sri Lanka’s highland wholesale hub."
      />
      <div className="guest-card prose prose-neutral max-w-none space-y-4 p-6 text-muted-foreground sm:p-8">
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
      </div>
    </div>
  );
}
