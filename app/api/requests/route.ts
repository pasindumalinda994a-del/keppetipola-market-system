import { NextResponse } from "next/server";
import { BuyingRequest } from "@/database/buying-request.model";
import { Vegetable } from "@/database/vegetable.model";
import {
  isAuthError,
  requireActiveRole,
  requireAuth,
} from "@/lib/actions/auth.actions";
import connectDB from "@/lib/mongodb";
import { parseDate, parsePositiveNumber } from "@/lib/serialize";
import type { QualityGrade } from "@/types";

const GRADES = new Set<QualityGrade>(["A", "B", "C"]);

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "1";
    const vegetableId = searchParams.get("vegetableId");

    const filter: Record<string, unknown> = {};

    if (mine) {
      const auth = await requireAuth(request);
      if (isAuthError(auth)) {
        return auth.error;
      }
      if (auth.user.role !== "trader" && auth.user.role !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (auth.user.role === "trader") {
        filter.traderId = auth.user._id;
      }
    } else {
      filter.status = "Active";
      filter.closingTime = { $gt: new Date() };
      filter.remainingKg = { $gt: 0 };
    }

    if (vegetableId) {
      filter.vegetableId = vegetableId;
    }

    const requests = await BuyingRequest.find(filter).sort(
      mine ? { createdAt: -1 } : { maxPrice: -1 }
    );
    return NextResponse.json({
      requests: requests.map((r) => r.toJSON()),
    });
  } catch (err) {
    console.error("listRequests error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveRole(request, "trader");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json();
    const quantityKg = parsePositiveNumber(body.quantityKg);
    const minPrice = parsePositiveNumber(body.minPrice);
    const maxPrice = parsePositiveNumber(body.maxPrice);
    const preferredGrade = String(body.preferredGrade || "") as QualityGrade;
    const pickupDate = parseDate(body.pickupDate);
    const closingTime = parseDate(body.closingTime);

    if (!body.vegetableId) {
      return NextResponse.json(
        { message: "Vegetable is required" },
        { status: 400 }
      );
    }
    if (!quantityKg || !minPrice || !maxPrice) {
      return NextResponse.json(
        { message: "Quantity and price range are required" },
        { status: 400 }
      );
    }
    if (maxPrice < minPrice) {
      return NextResponse.json(
        { message: "Maximum price must be at least the minimum price" },
        { status: 400 }
      );
    }
    if (!GRADES.has(preferredGrade)) {
      return NextResponse.json(
        { message: "Preferred grade must be A, B, or C" },
        { status: 400 }
      );
    }
    if (!pickupDate || !closingTime) {
      return NextResponse.json(
        { message: "Pickup date and closing time are required" },
        { status: 400 }
      );
    }

    const vegetable = await Vegetable.findById(body.vegetableId);
    if (!vegetable || vegetable.status !== "Active") {
      return NextResponse.json(
        { message: "Vegetable not found" },
        { status: 400 }
      );
    }

    const buyingRequest = await BuyingRequest.create({
      traderId: auth.user._id,
      traderName: auth.user.name,
      vegetableId: vegetable._id,
      vegetableName: vegetable.name,
      quantityKg,
      remainingKg: quantityKg,
      minPrice,
      maxPrice,
      preferredGrade,
      pickupDate,
      closingTime,
      notes: body.notes ? String(body.notes).trim() : "",
      status: "Active",
    });

    return NextResponse.json(
      { request: buyingRequest.toJSON() },
      { status: 201 }
    );
  } catch (err) {
    console.error("createRequest error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
