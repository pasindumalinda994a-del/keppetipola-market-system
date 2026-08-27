import { NextResponse } from "next/server";
import { Application } from "@/database/application.model";
import { BuyingRequest } from "@/database/buying-request.model";
import { Offer } from "@/database/offer.model";
import {
  isAuthError,
  requireActiveRole,
} from "@/lib/actions/auth.actions";
import { createNotification } from "@/lib/actions/marketplace.actions";
import { parseDate, parsePositiveNumber } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await requireActiveRole(request, "trader");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const application = await Application.findById(id);
    if (!application || application.status !== "Pending") {
      return NextResponse.json(
        { message: "Application is not available" },
        { status: 400 }
      );
    }

    const buyingRequest = await BuyingRequest.findById(application.requestId);
    if (
      !buyingRequest ||
      String(buyingRequest.traderId) !== String(auth.user._id)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (
      buyingRequest.status !== "Active" ||
      buyingRequest.closingTime.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { message: "This buying request is no longer open" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const price = parsePositiveNumber(body.price);
    const quantityKg = parsePositiveNumber(body.quantityKg);
    const delivery = parseDate(body.delivery ?? body.pickup);
    const message = body.message ? String(body.message).trim() : "";

    if (!price || !quantityKg || !delivery) {
      return NextResponse.json(
        { message: "Price, quantity, and pickup time are required" },
        { status: 400 }
      );
    }
    if (quantityKg > buyingRequest.remainingKg) {
      return NextResponse.json(
        { message: "Quantity exceeds remaining request" },
        { status: 400 }
      );
    }

    const existing = await Offer.findOne({
      applicationId: application._id,
      traderId: auth.user._id,
      status: "Pending",
    });
    if (existing) {
      return NextResponse.json(
        { message: "You already sent an offer for this application" },
        { status: 400 }
      );
    }

    const offer = await Offer.create({
      source: "application",
      applicationId: application._id,
      requestId: buyingRequest._id,
      farmerId: application.farmerId,
      traderId: auth.user._id,
      traderName: auth.user.name,
      farmerName: application.farmerName,
      vegetableName: application.vegetableName,
      price,
      quantityKg,
      delivery,
      message,
      status: "Pending",
    });

    application.status = "Offered";
    await application.save();

    await createNotification(
      application.farmerId,
      "Offers",
      `Offer from ${auth.user.name}`,
      `${auth.user.name} offered Rs.${price}/kg for ${quantityKg}kg of ${application.vegetableName}.`
    );

    return NextResponse.json({ offer: offer.toJSON() }, { status: 201 });
  } catch (err) {
    console.error("createApplicationOffer error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
