export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(160deg,oklch(0.94_0.04_145),oklch(0.98_0.01_90)_50%,oklch(0.95_0.04_75/0.5))] px-4 py-12">
      <div className="mb-8 text-center">
        <a href="/" className="font-heading text-2xl font-semibold text-primary">
          Keppetipola Market
        </a>
      </div>
      {children}
    </div>
  );
}
