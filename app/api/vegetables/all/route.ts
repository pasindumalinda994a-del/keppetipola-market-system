import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { Vegetable } from "@/database/vegetable.model";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const vegetables = await Vegetable.find().sort({ name: 1 });
    return NextResponse.json({
      vegetables: vegetables.map((v) => v.toJSON()),
    });
  } catch (err) {
    console.error("getAllVegetables error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
