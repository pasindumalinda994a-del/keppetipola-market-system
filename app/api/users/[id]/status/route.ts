import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { User, type AccountStatus } from "@/database/user.model";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES: AccountStatus[] = [
  "Active",
  "Inactive",
  "Rejected",
];

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json();
    const status = body.status as AccountStatus;
    const rejectionReason =
      typeof body.rejectionReason === "string"
        ? body.rejectionReason.trim()
        : "";

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { message: "Status must be Active, Inactive, or Rejected" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user._id.toString() === auth.user._id.toString()) {
      return NextResponse.json(
        { message: "You cannot change your own status" },
        { status: 400 }
      );
    }

    if (user.role === "admin") {
      if (status !== "Active" && status !== "Inactive") {
        return NextResponse.json(
          { message: "Admin accounts can only be Active or Inactive" },
          { status: 400 }
        );
      }
    }

    if (status === "Rejected" && user.status !== "Pending" && user.status !== "Rejected") {
      return NextResponse.json(
        { message: "Only pending applications can be rejected" },
        { status: 400 }
      );
    }

    user.status = status;
    user.reviewedAt = new Date();
    if (status === "Rejected") {
      user.rejectionReason = rejectionReason;
    } else if (status === "Active") {
      user.rejectionReason = "";
    }

    await user.save();
    return NextResponse.json({ user: user.toJSON() });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
