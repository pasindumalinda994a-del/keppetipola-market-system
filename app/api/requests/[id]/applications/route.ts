import { NextResponse } from "next/server";
import { Application } from "@/database/application.model";
import { BuyingRequest } from "@/database/buying-request.model";
import {
  isAuthError,
  requireActiveRole,
  requireAuth,
} from "@/lib/actions/auth.actions";
import { createNotification } from "@/lib/actions/marketplace.actions";
import { parseDate, parsePositiveNumber } from "@/lib/serialize";
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
    const buyingRequest = await BuyingRequest.findById(id);
    if (!buyingRequest) {
      return NextResponse.json(
        { message: "Buying request not found" },
        { status: 404 }
      );
    }

    const isOwner = String(buyingRequest.traderId) === String(auth.user._id);
    if (!isOwner && auth.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const applications = await Application.find({ requestId: buyingRequest._id }).sort({
      createdAt: -1,
    });
    return NextResponse.json({
      applications: applications.map((a) => a.toJSON()),
    });
  } catch (err) {
    console.error("listRequestApplications error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await requireActiveRole(request, "farmer");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const buyingRequest = await BuyingRequest.findById(id);
    if (
      !buyingRequest ||
      buyingRequest.status !== "Active" ||
      buyingRequest.closingTime.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { message: "This buying request is no longer open" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const quantityKg = parsePositiveNumber(body.quantityKg);
    const grade = String(body.grade || "") as QualityGrade;
    const harvestDate = parseDate(body.harvestDate);

    if (!quantityKg || !GRADES.has(grade) || !harvestDate) {
      return NextResponse.json(
        { message: "Quantity, grade, and harvest date are required" },
        { status: 400 }
      );
    }

    const existing = await Application.findOne({
      requestId: buyingRequest._id,
      farmerId: auth.user._id,
    });
    if (existing) {
      return NextResponse.json(
        { message: "You have already applied to this request" },
        { status: 400 }
      );
    }

    try {
      const application = await Application.create({
        requestId: buyingRequest._id,
        farmerId: auth.user._id,
        farmerName: auth.user.name,
        vegetableName: buyingRequest.vegetableName,
        quantityKg,
        grade,
        harvestDate,
        status: "Pending",
      });

      await createNotification(
        buyingRequest.traderId,
        "Applications",
        "New application",
        `${auth.user.name} applied to your ${buyingRequest.vegetableName} request.`
      );

      return NextResponse.json(
        { application: application.toJSON() },
        { status: 201 }
      );
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: number }).code === 11000
      ) {
        return NextResponse.json(
          { message: "You have already applied to this request" },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("applyToRequest error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
