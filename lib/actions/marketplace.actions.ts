import mongoose from "mongoose";
import { Application } from "@/database/application.model";
import { BuyingRequest } from "@/database/buying-request.model";
import { Harvest } from "@/database/harvest.model";
import { Notification, type NotificationGroup } from "@/database/notification.model";
import { Offer, type OfferDocument } from "@/database/offer.model";
import { Sale } from "@/database/sale.model";
import type { UserDocument } from "@/database/user.model";

export class MarketplaceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "MarketplaceError";
    this.status = status;
  }
}

export async function createNotification(
  userId: string | mongoose.Types.ObjectId,
  group: NotificationGroup,
  title: string,
  message: string
): Promise<void> {
  await Notification.create({
    userId,
    group,
    title,
    message,
    read: false,
  });
}

export async function acceptOffer(offerId: string, farmer: UserDocument) {
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new MarketplaceError("Offer not found", 404);
  }
  if (String(offer.farmerId) !== String(farmer._id)) {
    throw new MarketplaceError("Forbidden", 403);
  }
  if (offer.status !== "Pending") {
    throw new MarketplaceError("Offer is no longer pending");
  }

  if (offer.source === "harvest" && offer.harvestId) {
    return acceptHarvestOffer(offer, farmer);
  }
  if (offer.source === "application" && offer.applicationId) {
    return acceptApplicationOffer(offer, farmer);
  }
  throw new MarketplaceError("Offer is missing its source listing");
}

async function acceptHarvestOffer(offer: OfferDocument, farmer: UserDocument) {
  const harvest = await Harvest.findOneAndUpdate(
    {
      _id: offer.harvestId,
      farmerId: farmer._id,
      status: "Active",
      remainingKg: { $gte: offer.quantityKg },
    },
    { $inc: { remainingKg: -offer.quantityKg } },
    { new: true }
  );

  if (!harvest) {
    throw new MarketplaceError(
      "Harvest is not available for this quantity"
    );
  }

  if (harvest.remainingKg <= 0) {
    harvest.status = "Completed";
    harvest.remainingKg = 0;
    await harvest.save();
  }

  const sale = await Sale.create({
    farmerId: harvest.farmerId,
    traderId: offer.traderId,
    farmerName: harvest.farmerName,
    traderName: offer.traderName,
    vegetableId: harvest.vegetableId,
    vegetableName: harvest.vegetableName,
    quantityKg: offer.quantityKg,
    unitPrice: offer.price,
    total: offer.price * offer.quantityKg,
    delivery: offer.delivery,
    sourceOfferId: offer._id,
    harvestId: harvest._id,
    status: "Accepted",
    date: new Date(),
  });

  offer.status = "Accepted";
  await offer.save();

  await Offer.updateMany(
    {
      harvestId: harvest._id,
      status: "Pending",
      _id: { $ne: offer._id },
    },
    { $set: { status: "Cancelled" } }
  );

  await createNotification(
    offer.traderId,
    "Accepted Offers",
    "Offer accepted",
    `${farmer.name} accepted your offer for ${harvest.vegetableName} (${offer.quantityKg} kg).`
  );

  return sale;
}

async function acceptApplicationOffer(
  offer: OfferDocument,
  farmer: UserDocument
) {
  const application = await Application.findById(offer.applicationId);
  if (!application || String(application.farmerId) !== String(farmer._id)) {
    throw new MarketplaceError("Application not found", 404);
  }
  if (application.status === "Cancelled") {
    throw new MarketplaceError("Application was cancelled");
  }

  const request = await BuyingRequest.findOneAndUpdate(
    {
      _id: offer.requestId ?? application.requestId,
      status: "Active",
      remainingKg: { $gte: offer.quantityKg },
      closingTime: { $gt: new Date() },
    },
    { $inc: { remainingKg: -offer.quantityKg } },
    { new: true }
  );

  if (!request) {
    throw new MarketplaceError(
      "Buying request is not available for this quantity"
    );
  }

  if (request.remainingKg <= 0) {
    request.status = "Closed";
    request.remainingKg = 0;
    await request.save();

    const leftoverApps = await Application.find({
      requestId: request._id,
      status: { $in: ["Pending", "Offered"] },
      _id: { $ne: application._id },
    });
    if (leftoverApps.length) {
      await Application.updateMany(
        {
          requestId: request._id,
          status: { $in: ["Pending", "Offered"] },
          _id: { $ne: application._id },
        },
        { $set: { status: "Cancelled" } }
      );
      await Promise.all(
        leftoverApps.map((app) =>
          createNotification(
            app.farmerId,
            "Applications",
            "Buying request filled",
            `The ${request.vegetableName} request is no longer open.`
          )
        )
      );
    }
    await Offer.updateMany(
      {
        requestId: request._id,
        status: "Pending",
        _id: { $ne: offer._id },
      },
      { $set: { status: "Cancelled" } }
    );
  }

  const sale = await Sale.create({
    farmerId: application.farmerId,
    traderId: offer.traderId,
    farmerName: application.farmerName,
    traderName: offer.traderName,
    vegetableId: request.vegetableId,
    vegetableName: request.vegetableName,
    quantityKg: offer.quantityKg,
    unitPrice: offer.price,
    total: offer.price * offer.quantityKg,
    delivery: offer.delivery,
    sourceOfferId: offer._id,
    requestId: request._id,
    status: "Accepted",
    date: new Date(),
  });

  offer.status = "Accepted";
  await offer.save();

  application.status = "Accepted";
  await application.save();

  await Offer.updateMany(
    {
      applicationId: application._id,
      status: "Pending",
      _id: { $ne: offer._id },
    },
    { $set: { status: "Cancelled" } }
  );

  await createNotification(
    offer.traderId,
    "Accepted Offers",
    "Offer accepted",
    `${farmer.name} accepted your offer for ${request.vegetableName} (${offer.quantityKg} kg).`
  );

  return sale;
}

export async function rejectOffer(offerId: string, farmer: UserDocument) {
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new MarketplaceError("Offer not found", 404);
  }
  if (String(offer.farmerId) !== String(farmer._id)) {
    throw new MarketplaceError("Forbidden", 403);
  }
  if (offer.status !== "Pending") {
    throw new MarketplaceError("Offer is no longer pending");
  }

  offer.status = "Cancelled";
  await offer.save();

  if (offer.applicationId) {
    await Application.updateOne(
      { _id: offer.applicationId, status: "Offered" },
      { $set: { status: "Pending" } }
    );
  }

  await createNotification(
    offer.traderId,
    "Offers",
    "Offer rejected",
    `${farmer.name} rejected your offer for ${offer.vegetableName}.`
  );

  return offer;
}

export async function closeHarvestListing(
  harvestId: string,
  farmerId: string,
  status: "Closed" | "Cancelled"
) {
  const harvest = await Harvest.findOne({ _id: harvestId, farmerId });
  if (!harvest) {
    throw new MarketplaceError("Harvest not found", 404);
  }
  if (harvest.status !== "Active") {
    throw new MarketplaceError("Only active harvests can be closed");
  }

  harvest.status = status;
  await harvest.save();

  const pending = await Offer.find({
    harvestId: harvest._id,
    status: "Pending",
  });
  if (pending.length) {
    await Offer.updateMany(
      { harvestId: harvest._id, status: "Pending" },
      { $set: { status: "Cancelled" } }
    );
    await Promise.all(
      pending.map((offer) =>
        createNotification(
          offer.traderId,
          "Offers",
          "Harvest listing closed",
          `${harvest.farmerName} closed the ${harvest.vegetableName} harvest listing.`
        )
      )
    );
  }

  return harvest;
}

export async function closeBuyingRequestListing(
  requestId: string,
  traderId: string,
  status: "Closed" | "Cancelled"
) {
  const buyingRequest = await BuyingRequest.findOne({
    _id: requestId,
    traderId,
  });
  if (!buyingRequest) {
    throw new MarketplaceError("Buying request not found", 404);
  }
  if (buyingRequest.status !== "Active") {
    throw new MarketplaceError("Only active requests can be closed");
  }

  buyingRequest.status = status;
  await buyingRequest.save();

  const openApps = await Application.find({
    requestId: buyingRequest._id,
    status: { $in: ["Pending", "Offered"] },
  });
  if (openApps.length) {
    await Application.updateMany(
      {
        requestId: buyingRequest._id,
        status: { $in: ["Pending", "Offered"] },
      },
      { $set: { status: "Cancelled" } }
    );
    await Promise.all(
      openApps.map((application) =>
        createNotification(
          application.farmerId,
          "Applications",
          "Buying request closed",
          `${buyingRequest.traderName} closed the ${buyingRequest.vegetableName} request.`
        )
      )
    );
  }

  await Offer.updateMany(
    { requestId: buyingRequest._id, status: "Pending" },
    { $set: { status: "Cancelled" } }
  );

  return buyingRequest;
}

export async function completeSale(saleId: string, user: UserDocument) {
  const sale = await Sale.findById(saleId);
  if (!sale) {
    throw new MarketplaceError("Sale not found", 404);
  }

  const isParty =
    String(sale.farmerId) === String(user._id) ||
    String(sale.traderId) === String(user._id);
  if (!isParty && user.role !== "admin") {
    throw new MarketplaceError("Forbidden", 403);
  }
  if (sale.status !== "Accepted") {
    throw new MarketplaceError("Only accepted sales can be completed");
  }

  sale.status = "Completed";
  await sale.save();

  const otherId =
    String(sale.farmerId) === String(user._id) ? sale.traderId : sale.farmerId;
  await createNotification(
    otherId,
    "Sales",
    "Sale completed",
    `${sale.vegetableName} sale (${sale.quantityKg} kg) was marked completed.`
  );

  return sale;
}
