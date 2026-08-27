import { NextResponse } from "next/server";
import { Offer } from "@/database/offer.model";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const harvestId = searchParams.get("harvestId");
    const filter: Record<string, unknown> = {};

    if (auth.user.role === "farmer") {
      filter.farmerId = auth.user._id;
    } else if (auth.user.role === "trader") {
      filter.traderId = auth.user._id;
    } else if (auth.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (harvestId) {
      filter.harvestId = harvestId;
    }

    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({
      offers: offers.map((o) => o.toJSON()),
    });
  } catch (err) {
    console.error("listOffers error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
