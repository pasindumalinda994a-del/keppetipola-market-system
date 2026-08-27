import { NextResponse } from "next/server";
import { Sale } from "@/database/sale.model";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const filter: Record<string, unknown> = {};

    if (auth.user.role === "farmer") {
      filter.farmerId = auth.user._id;
    } else if (auth.user.role === "trader") {
      filter.traderId = auth.user._id;
    } else if (auth.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (status) {
      const statuses = status.split(",").map((s) => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        filter.status = statuses[0];
      } else if (statuses.length > 1) {
        filter.status = { $in: statuses };
      }
    }

    const sales = await Sale.find(filter).sort({ date: -1, createdAt: -1 });
    return NextResponse.json({
      sales: sales.map((s) => s.toJSON()),
    });
  } catch (err) {
    console.error("listSales error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
