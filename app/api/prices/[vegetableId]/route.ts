import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { writeSystemLog } from "@/lib/actions/log.actions";
import { upsertPriceSnapshot } from "@/lib/actions/price-history.actions";
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

    const oldAverage = price.average;
    const newAverage = Math.round((lowestNum + highestNum) / 2);
    let change = 0;

    if (oldAverage > 0) {
      change = Math.round(((newAverage - oldAverage) / oldAverage) * 100);
    }

    price.lowest = lowestNum;
    price.highest = highestNum;
    price.average = newAverage;
    price.change = change;
    price.lastUpdated = new Date();

    await price.save();
    await upsertPriceSnapshot({
      vegetableId: price.vegetableId,
      lowest: price.lowest,
      highest: price.highest,
      average: price.average,
    });
    await writeSystemLog(
      "Price Update",
      `${price.vegetableName} average updated to Rs.${newAverage}`,
      auth.user.email
    );
    return NextResponse.json({ price: price.toJSON() });
  } catch (err) {
    console.error("updatePrice error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
