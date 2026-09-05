import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { MarketPrice } from "@/database/market-price.model";
import { Vegetable } from "@/database/vegetable.model";
import { normalizeProduceCategory } from "@/lib/produce";

export async function GET() {
  try {
    await connectDB();
    const [prices, vegetables] = await Promise.all([
      MarketPrice.find().sort({ vegetableName: 1 }),
      Vegetable.find().select("_id category").lean(),
    ]);
    const categoryById = new Map(
      vegetables.map((vegetable) => [
        String(vegetable._id),
        normalizeProduceCategory(vegetable.category),
      ])
    );
    return NextResponse.json({
      prices: prices.map((price) => ({
        ...price.toJSON(),
        category:
          categoryById.get(String(price.vegetableId)) ?? "Other",
      })),
    });
  } catch (err) {
    console.error("getPrices error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
