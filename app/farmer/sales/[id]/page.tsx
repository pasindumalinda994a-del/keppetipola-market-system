import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { sales } from "@/lib/mock";

export default async function SaleInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = sales.find((s) => s.id === id);
  if (!sale) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Sale invoice"
        description={sale.id.toUpperCase()}
        action={
          <Button variant="outline" asChild>
            <Link href="/farmer/sales">Back</Link>
          </Button>
        }
      />
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-heading text-lg font-semibold text-primary">
              Keppetipola Market
            </p>
            <p className="text-sm text-muted-foreground">Sale receipt</p>
          </div>
          <StatusBadge status={sale.status} />
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="font-medium">{formatDate(sale.date)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Trader</dt>
            <dd className="font-medium">{sale.traderName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Vegetable</dt>
            <dd className="font-medium">{sale.vegetableName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Quantity</dt>
            <dd className="font-medium">{formatKg(sale.quantityKg)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Unit price</dt>
            <dd className="font-medium">{formatLKR(sale.unitPrice)}</dd>
          </div>
          <div className="flex justify-between border-t pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-semibold text-price-foreground">
              {formatLKR(sale.total)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
