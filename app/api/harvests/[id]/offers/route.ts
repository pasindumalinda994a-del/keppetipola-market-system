import { NextResponse } from "next/server";
import { Harvest } from "@/database/harvest.model";
import { Offer } from "@/database/offer.model";
import {
  isAuthError,
  requireActiveRole,
} from "@/lib/actions/auth.actions";
import { createNotification } from "@/lib/actions/marketplace.actions";
import { formatOfferNotification } from "@/lib/actions/settings.actions";
import { parseDate, parsePositiveNumber } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await requireActiveRole(request, "trader");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const harvest = await Harvest.findById(id);
    if (!harvest || harvest.status !== "Active") {
      return NextResponse.json(
        { message: "Harvest is not available" },
        { status: 404 }
      );
    }
    if (harvest.availableUntil.getTime() < Date.now()) {
      return NextResponse.json(
        { message: "This harvest listing has expired" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const price = parsePositiveNumber(body.price);
    const quantityKg = parsePositiveNumber(body.quantityKg);
    const delivery = parseDate(body.delivery);
    const message = body.message ? String(body.message).trim() : "";

    if (!price || !quantityKg || !delivery) {
      return NextResponse.json(
        { message: "Price, quantity, and delivery date are required" },
        { status: 400 }
      );
    }
    if (quantityKg > harvest.remainingKg) {
      return NextResponse.json(
        { message: "Quantity exceeds remaining harvest" },
        { status: 400 }
      );
    }

    const existing = await Offer.findOne({
      harvestId: harvest._id,
      traderId: auth.user._id,
      status: "Pending",
    });
    if (existing) {
      return NextResponse.json(
        { message: "You already have a pending offer on this harvest" },
        { status: 400 }
      );
    }

    const offer = await Offer.create({
      source: "harvest",
      harvestId: harvest._id,
      farmerId: harvest.farmerId,
      traderId: auth.user._id,
      traderName: auth.user.name,
      farmerName: harvest.farmerName,
      vegetableName: harvest.vegetableName,
      price,
      quantityKg,
      delivery,
      message,
      status: "Pending",
    });

    harvest.applications += 1;
    await harvest.save();

    await createNotification(
      harvest.farmerId,
      "Offers",
      `New offer on ${harvest.vegetableName}`,
      await formatOfferNotification({
        trader: auth.user.name,
        price,
        vegetable: harvest.vegetableName,
      })
    );

    return NextResponse.json({ offer: offer.toJSON() }, { status: 201 });
  } catch (err) {
    console.error("createHarvestOffer error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
