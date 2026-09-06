import Image from "next/image";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LocaleProvider } from "@/components/providers/locale-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <div className="guest-site guest-auth relative flex min-h-dvh flex-1 flex-col">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <Image
            src="/images/Farmers_loading_harvest_into_lorry_2K_202609060807.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
          <SiteHeader />
          <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
            <div className="mb-5 flex w-full max-w-2xl justify-end">
              <LanguageToggle />
            </div>
            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both">
              {children}
            </div>
          </main>
          <SiteFooter />
        </div>
      </div>
    </LocaleProvider>
  );
}
