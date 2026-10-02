import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { writeSystemLog } from "@/lib/actions/log.actions";
import { setPriceRange } from "@/lib/actions/market-price.actions";
import { MarketPrice } from "@/database/market-price.model";

type Params = { params: Promise<{ vegetableId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json();
    const { lowest, highest } = body;

    if (lowest === undefined || highest === undefined) {
      return NextResponse.json(
        { message: "Lowest and highest prices are required" },
        { status: 400 }
      );
    }

    const lowestNum = Number(lowest);
    const highestNum = Number(highest);

    if (Number.isNaN(lowestNum) || Number.isNaN(highestNum)) {
      return NextResponse.json(
        { message: "Prices must be numbers" },
        { status: 400 }
      );
    }

    if (lowestNum > highestNum) {
      return NextResponse.json(
        { message: "Lowest price cannot exceed highest price" },
        { status: 400 }
      );
    }

    const { vegetableId } = await params;
    const price = await MarketPrice.findOne({ vegetableId });

    if (!price) {
      return NextResponse.json(
        { message: "Price record not found" },
        { status: 404 }
      );
    }

    await setPriceRange(price, {
      lowest: lowestNum,
      highest: highestNum,
      source: "admin",
    });
    await writeSystemLog(
      "Price Update",
      `${price.vegetableName} average updated to Rs.${price.average}`,
      auth.user.email
    );
    return NextResponse.json({ price: price.toJSON() });
  } catch (err) {
    console.error("updatePrice error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
