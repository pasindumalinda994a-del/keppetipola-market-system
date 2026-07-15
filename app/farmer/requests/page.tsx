"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDateTime, formatKg, formatLKR } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { buyingRequests } from "@/lib/mock";

function traderInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function FarmerRequestsPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return buyingRequests
      .filter((r) => {
        return (
          !q ||
          r.vegetableName.toLowerCase().includes(q.toLowerCase()) ||
          r.traderName.toLowerCase().includes(q.toLowerCase())
        );
      })
      .sort((a, b) => b.maxPrice - a.maxPrice);
  }, [q]);

  return (
    <div>
      <PageHeader
        title="Trader Requests"
        description="Apply to buying requests sorted by highest price."
      />
      <div className="mb-6">
        <SearchBar value={q} onChange={setQ} placeholder="Search…" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <article key={r.id} className="flex flex-col rounded-lg bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar size="lg" className="size-11">
                  {r.traderPhotoUrl ? (
                    <AvatarImage src={r.traderPhotoUrl} alt={r.traderName} />
                  ) : null}
                  <AvatarFallback>{traderInitials(r.traderName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Trader</p>
                  <h3 className="truncate font-semibold">{r.traderName}</h3>
                </div>
              </div>
              <span className="shrink-0 rounded-lg bg-secondary px-2 py-1 text-xs font-medium">
                Grade {r.preferredGrade}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Needs</dt>
                <dd className="font-medium">
                  {r.vegetableName} · {formatKg(r.quantityKg)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Price range</dt>
                <dd className="font-semibold text-price-foreground">
                  {formatLKR(r.minPrice)}–{formatLKR(r.maxPrice)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Closes</dt>
                <dd className="font-medium">{formatDateTime(r.closingTime)}</dd>
              </div>
            </dl>
            <Button
              className="mt-4 w-full"
              onClick={() => toast.success(`Applied to ${r.traderName}`)}
            >
              Apply
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
