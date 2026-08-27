import { NextResponse } from "next/server";
import { Application } from "@/database/application.model";
import { BuyingRequest } from "@/database/buying-request.model";
import {
  isAuthError,
  requireActiveRole,
} from "@/lib/actions/auth.actions";
import { createNotification } from "@/lib/actions/marketplace.actions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireActiveRole(request, "trader");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    const buyingRequest = await BuyingRequest.findById(application.requestId);
    if (
      !buyingRequest ||
      String(buyingRequest.traderId) !== String(auth.user._id)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (body.status !== "Cancelled") {
      return NextResponse.json(
        { message: "Status must be Cancelled" },
        { status: 400 }
      );
    }
    if (application.status !== "Pending") {
      return NextResponse.json(
        { message: "Only pending applications can be rejected" },
        { status: 400 }
      );
    }

    application.status = "Cancelled";
    await application.save();

    await createNotification(
      application.farmerId,
      "Applications",
      "Application rejected",
      `${auth.user.name} rejected your application for ${application.vegetableName}.`
    );

    return NextResponse.json({ application: application.toJSON() });
  } catch (err) {
    console.error("updateApplication error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
