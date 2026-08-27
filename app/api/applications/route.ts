import { NextResponse } from "next/server";
import { Application } from "@/database/application.model";
import { BuyingRequest } from "@/database/buying-request.model";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    if (auth.user.role === "farmer") {
      const applications = await Application.find({
        farmerId: auth.user._id,
      }).sort({ createdAt: -1 });
      return NextResponse.json({
        applications: applications.map((a) => a.toJSON()),
      });
    }

    if (auth.user.role === "trader") {
      const requests = await BuyingRequest.find({ traderId: auth.user._id }).select(
        "_id"
      );
      const applications = await Application.find({
        requestId: { $in: requests.map((r) => r._id) },
      }).sort({ createdAt: -1 });
      return NextResponse.json({
        applications: applications.map((a) => a.toJSON()),
      });
    }

    if (auth.user.role === "admin") {
      const applications = await Application.find().sort({ createdAt: -1 });
      return NextResponse.json({
        applications: applications.map((a) => a.toJSON()),
      });
    }

    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  } catch (err) {
    console.error("listApplications error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
