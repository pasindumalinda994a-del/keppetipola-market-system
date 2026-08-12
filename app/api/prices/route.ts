import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { MarketPrice } from "@/database/market-price.model";

export async function GET() {
  try {
    await connectDB();
    const prices = await MarketPrice.find().sort({ vegetableName: 1 });
    return NextResponse.json({ prices: prices.map((p) => p.toJSON()) });
  } catch (err) {
    console.error("getPrices error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
