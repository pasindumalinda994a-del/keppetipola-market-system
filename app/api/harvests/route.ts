import { NextResponse } from "next/server";
import { Harvest } from "@/database/harvest.model";
import { Vegetable } from "@/database/vegetable.model";
import {
  isAuthError,
  requireActiveRole,
  requireAuth,
} from "@/lib/actions/auth.actions";
import { parseDate, parsePositiveNumber } from "@/lib/serialize";
import {
  asBinaryFile,
  assertValidImage,
  removeHarvestFiles,
  saveHarvestPhoto,
  UploadError,
  type BinaryFile,
} from "@/lib/uploads";
import type { QualityGrade } from "@/types";

const GRADES = new Set<QualityGrade>(["A", "B", "C"]);

async function readCreatePayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const photos = form
      .getAll("photos")
      .map((item) => asBinaryFile(item))
      .filter((item): item is BinaryFile => item !== null && item.size > 0);
    return {
      vegetableId: String(form.get("vegetableId") || ""),
      quantityKg: form.get("quantityKg"),
      qualityGrade: String(form.get("qualityGrade") || ""),
      harvestDate: form.get("harvestDate"),
      expectedDelivery: form.get("expectedDelivery"),
      availableUntil: form.get("availableUntil"),
      photos,
    };
  }

  const body = await request.json();
  return {
    vegetableId: String(body.vegetableId || ""),
    quantityKg: body.quantityKg,
    qualityGrade: String(body.qualityGrade || ""),
    harvestDate: body.harvestDate,
    expectedDelivery: body.expectedDelivery,
    availableUntil: body.availableUntil,
    photos: [] as BinaryFile[],
  };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "1";
    const vegetableId = searchParams.get("vegetableId");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter: Record<string, unknown> = {};

    if (auth.user.role === "farmer" || mine) {
      if (auth.user.role !== "farmer") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      filter.farmerId = auth.user._id;
    } else if (auth.user.role === "trader") {
      filter.status = "Active";
      filter.availableUntil = { $gte: today };
      filter.remainingKg = { $gt: 0 };
    } else if (auth.user.role === "admin") {
      // no extra filter
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (vegetableId) {
      filter.vegetableId = vegetableId;
    }

    const harvests = await Harvest.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({
      harvests: harvests.map((h) => h.toJSON()),
    });
  } catch (err) {
    console.error("listHarvests error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveRole(request, "farmer");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const payload = await readCreatePayload(request);
    const quantityKg = parsePositiveNumber(payload.quantityKg);
    const harvestDate = parseDate(payload.harvestDate);
    const expectedDelivery = parseDate(payload.expectedDelivery);
    const availableUntil = parseDate(payload.availableUntil);
    const qualityGrade = payload.qualityGrade as QualityGrade;

    if (!payload.vegetableId) {
      return NextResponse.json(
        { message: "Vegetable is required" },
        { status: 400 }
      );
    }
    if (!quantityKg) {
      return NextResponse.json(
        { message: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }
    if (!GRADES.has(qualityGrade)) {
      return NextResponse.json(
        { message: "Quality grade must be A, B, or C" },
        { status: 400 }
      );
    }
    if (!harvestDate || !expectedDelivery || !availableUntil) {
      return NextResponse.json(
        { message: "Harvest, delivery, and available-until dates are required" },
        { status: 400 }
      );
    }

    const vegetable = await Vegetable.findById(payload.vegetableId);
    if (!vegetable || vegetable.status !== "Active") {
      return NextResponse.json(
        { message: "Vegetable not found" },
        { status: 400 }
      );
    }

    const harvest = await Harvest.create({
      farmerId: auth.user._id,
      farmerName: auth.user.name,
      vegetableId: vegetable._id,
      vegetableName: vegetable.name,
      quantityKg,
      remainingKg: quantityKg,
      qualityGrade,
      harvestDate,
      expectedDelivery,
      availableUntil,
      status: "Active",
      applications: 0,
      photos: [],
    });

    if (payload.photos.length) {
      try {
        const saved: string[] = [];
        for (let i = 0; i < payload.photos.length; i += 1) {
          const file = assertValidImage(payload.photos[i], `Photo ${i + 1}`);
          saved.push(await saveHarvestPhoto(String(harvest._id), i, file));
        }
        harvest.photos = saved;
        await harvest.save();
      } catch (err) {
        await removeHarvestFiles(String(harvest._id));
        await Harvest.findByIdAndDelete(harvest._id);
        throw err;
      }
    }

    return NextResponse.json({ harvest: harvest.toJSON() }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    console.error("createHarvest error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
