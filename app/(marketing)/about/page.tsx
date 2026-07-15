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

      </div>

    </div>

  );

}

