import { NextResponse } from "next/server";
import { Sale } from "@/database/sale.model";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";
import {
  completeSale,
  MarketplaceError,
} from "@/lib/actions/marketplace.actions";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const sale = await Sale.findById(id);
    if (!sale) {
      return NextResponse.json({ message: "Sale not found" }, { status: 404 });
    }

    const isParty =
      String(sale.farmerId) === String(auth.user._id) ||
      String(sale.traderId) === String(auth.user._id);
    if (!isParty && auth.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ sale: sale.toJSON() });
  } catch (err) {
    console.error("getSale error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json();
    if (body.status !== "Completed") {
      return NextResponse.json(
        { message: "Status must be Completed" },
        { status: 400 }
      );
    }

    const sale = await completeSale(id, auth.user);
    return NextResponse.json({ sale: sale.toJSON() });
  } catch (err) {
    if (err instanceof MarketplaceError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateSale error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
