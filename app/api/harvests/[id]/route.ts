import { NextResponse } from "next/server";
import { Harvest } from "@/database/harvest.model";
import { Offer } from "@/database/offer.model";
import { Sale } from "@/database/sale.model";
import { Vegetable } from "@/database/vegetable.model";
import {
  isAuthError,
  requireActiveRole,
  requireAuth,
} from "@/lib/actions/auth.actions";
import {
  closeHarvestListing,
  MarketplaceError,
} from "@/lib/actions/marketplace.actions";
import { parseDate, parsePositiveNumber } from "@/lib/serialize";
import { removeHarvestFiles } from "@/lib/uploads";
import type { QualityGrade } from "@/types";

type Params = { params: Promise<{ id: string }> };

const GRADES = new Set<QualityGrade>(["A", "B", "C"]);

export async function GET(request: Request, { params }: Params) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const harvest = await Harvest.findById(id);
    if (!harvest) {
      return NextResponse.json({ message: "Harvest not found" }, { status: 404 });
    }

    const isOwner = String(harvest.farmerId) === String(auth.user._id);
    if (!isOwner && auth.user.role !== "trader" && auth.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const offers = await Offer.find({ harvestId: harvest._id }).sort({
      price: -1,
    });

    return NextResponse.json({
      harvest: harvest.toJSON(),
      offers: offers.map((o) => o.toJSON()),
    });
  } catch (err) {
    console.error("getHarvest error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireActiveRole(request, "farmer");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const harvest = await Harvest.findOne({
      _id: id,
      farmerId: auth.user._id,
    });
    if (!harvest) {
      return NextResponse.json({ message: "Harvest not found" }, { status: 404 });
    }

    const body = await request.json();

    if (body.status === "Closed" || body.status === "Cancelled") {
      const closed = await closeHarvestListing(
        id,
        String(auth.user._id),
        body.status
      );
      return NextResponse.json({ harvest: closed.toJSON() });
    }

    const accepted = await Offer.exists({
      harvestId: harvest._id,
      status: "Accepted",
    });
    if (accepted) {
      return NextResponse.json(
        { message: "Cannot edit a harvest with an accepted offer" },
        { status: 400 }
      );
    }
    if (harvest.status !== "Active") {
      return NextResponse.json(
        { message: "Only active harvests can be edited" },
        { status: 400 }
      );
    }

    if (body.vegetableId) {
      const vegetable = await Vegetable.findById(body.vegetableId);
      if (!vegetable || vegetable.status !== "Active") {
        return NextResponse.json(
          { message: "Vegetable not found" },
          { status: 400 }
        );
      }
      harvest.vegetableId = vegetable._id;
      harvest.vegetableName = vegetable.name;
    }
    if (body.quantityKg !== undefined) {
      const quantityKg = parsePositiveNumber(body.quantityKg);
      if (!quantityKg) {
        return NextResponse.json(
          { message: "Quantity must be greater than 0" },
          { status: 400 }
        );
      }
      const sold = harvest.quantityKg - harvest.remainingKg;
      if (quantityKg < sold) {
        return NextResponse.json(
          { message: "Quantity cannot be less than already sold amount" },
          { status: 400 }
        );
      }
      harvest.remainingKg = quantityKg - sold;
      harvest.quantityKg = quantityKg;
    }
    if (body.qualityGrade) {
      if (!GRADES.has(body.qualityGrade)) {
        return NextResponse.json(
          { message: "Quality grade must be A, B, or C" },
          { status: 400 }
        );
      }
      harvest.qualityGrade = body.qualityGrade;
    }
    if (body.harvestDate) {
      const harvestDate = parseDate(body.harvestDate);
      if (!harvestDate) {
        return NextResponse.json({ message: "Invalid harvest date" }, { status: 400 });
      }
      harvest.harvestDate = harvestDate;
    }
    if (body.expectedDelivery) {
      const expectedDelivery = parseDate(body.expectedDelivery);
      if (!expectedDelivery) {
        return NextResponse.json({ message: "Invalid delivery date" }, { status: 400 });
      }
      harvest.expectedDelivery = expectedDelivery;
    }
    if (body.availableUntil) {
      const availableUntil = parseDate(body.availableUntil);
      if (!availableUntil) {
        return NextResponse.json(
          { message: "Invalid available-until date" },
          { status: 400 }
        );
      }
      harvest.availableUntil = availableUntil;
    }

    await harvest.save();
    return NextResponse.json({ harvest: harvest.toJSON() });
  } catch (err) {
    if (err instanceof MarketplaceError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateHarvest error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const auth = await requireActiveRole(request, "farmer");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const harvest = await Harvest.findOne({
      _id: id,
      farmerId: auth.user._id,
    });
    if (!harvest) {
      return NextResponse.json({ message: "Harvest not found" }, { status: 404 });
    }

    const hasSale = await Sale.exists({ harvestId: harvest._id });
    if (hasSale) {
      return NextResponse.json(
        { message: "Cannot delete a harvest with sales" },
        { status: 400 }
      );
    }

    await Offer.deleteMany({ harvestId: harvest._id });
    await removeHarvestFiles(String(harvest._id));
    await harvest.deleteOne();
    return NextResponse.json({ message: "Harvest deleted" });
  } catch (err) {
    console.error("deleteHarvest error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
