import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import {
  getPriceHistories,
  parsePriceHistoryRange,
} from "@/lib/actions/price-history.actions";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const ids = (searchParams.get("ids") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const range = parsePriceHistoryRange(searchParams.get("range"));
    const histories = await getPriceHistories(ids, range);
    return NextResponse.json({ histories });
  } catch (err) {
    console.error("getPriceHistory error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
