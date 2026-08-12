import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { MarketPrice } from "@/database/market-price.model";
import { Vegetable } from "@/database/vegetable.model";

export async function GET() {
  try {
    await connectDB();
    const vegetables = await Vegetable.find({ status: "Active" }).sort({
      name: 1,
    });
    return NextResponse.json({
      vegetables: vegetables.map((v) => v.toJSON()),
    });
  } catch (err) {
    console.error("getActiveVegetables error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json();
    const { name, category, unit, imageUrl } = body;

    if (!name || !category) {
      return NextResponse.json(
        { message: "Name and category are required" },
        { status: 400 }
      );
    }

    const vegetable = await Vegetable.create({
      name: String(name).trim(),
      category: String(category).trim(),
      unit: unit ? String(unit).trim() : "kg",
      imageUrl: imageUrl ? String(imageUrl).trim() : "",
      status: "Active",
    });

    await MarketPrice.create({
      vegetableId: vegetable._id,
      vegetableName: vegetable.name,
      imageUrl: vegetable.imageUrl,
      lowest: 0,
      highest: 0,
      average: 0,
      change: 0,
      lastUpdated: new Date(),
    });

    return NextResponse.json(
      { vegetable: vegetable.toJSON() },
      { status: 201 }
    );
  } catch (err) {
    console.error("createVegetable error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
