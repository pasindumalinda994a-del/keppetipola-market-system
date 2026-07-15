import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 [&_:is(h1,h2,h3,h4,h5,h6)]:font-satoshi [&_:is(h1,h2,h3,h4,h5,h6)]:!font-normal [&_:is(h1,h2,h3,h4,h5,h6)]:uppercase">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
