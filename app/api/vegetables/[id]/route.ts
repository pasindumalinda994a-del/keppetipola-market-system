import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { MarketPrice } from "@/database/market-price.model";
import { Vegetable } from "@/database/vegetable.model";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const vegetable = await Vegetable.findById(id);
    if (!vegetable) {
      return NextResponse.json(
        { message: "Vegetable not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, category, unit, status, imageUrl } = body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return NextResponse.json(
          { message: "Name is required" },
          { status: 400 }
        );
      }
      vegetable.name = String(name).trim();
    }
    if (category !== undefined) {
      vegetable.category = String(category).trim();
    }
    if (unit !== undefined) {
      vegetable.unit = String(unit).trim();
    }
    if (status !== undefined) {
      if (status !== "Active" && status !== "Inactive") {
        return NextResponse.json(
          { message: "Status must be Active or Inactive" },
          { status: 400 }
        );
      }
      vegetable.status = status;
    }
    if (imageUrl !== undefined) {
      vegetable.imageUrl = String(imageUrl).trim();
    }

    await vegetable.save();

    await MarketPrice.updateOne(
      { vegetableId: vegetable._id },
      {
        vegetableName: vegetable.name,
        imageUrl: vegetable.imageUrl,
      }
    );

    return NextResponse.json({ vegetable: vegetable.toJSON() });
  } catch (err) {
    console.error("updateVegetable error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
