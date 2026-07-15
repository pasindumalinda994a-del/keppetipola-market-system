import { BrandLogo } from "@/components/layout/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, #f4f4f3 0%, #f7f8f6 50%, #f2f5f0 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23337418' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] -z-10 size-112 rounded-full opacity-40 blur-3xl"
        style={{ background: "rgba(93, 214, 44, 0.12)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-[-8%] -z-10 size-96 rounded-full opacity-35 blur-3xl"
        style={{ background: "rgba(15, 15, 15, 0.06)" }}
      />

      <header className="mb-8 flex w-full max-w-md flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <BrandLogo href="/" size="xl" priority />
        <p className="mt-3 text-sm text-muted-foreground">
          Wholesale prices &amp; demand for farmers and traders
        </p>
      </header>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both [animation-delay:80ms]">
        {children}
      </div>
    </div>
  );
}
