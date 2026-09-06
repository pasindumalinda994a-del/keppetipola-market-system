import Image from "next/image";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { LocaleProvider } from "@/components/providers/locale-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
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

        <div className="fixed right-4 top-4 z-10 rounded-lg bg-card/85 shadow-sm backdrop-blur-sm">
          <LanguageToggle />
        </div>

        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both">
          {children}
        </div>
      </div>
    </LocaleProvider>
  );
}
