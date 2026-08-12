import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { User } from "@/database/user.model";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json();
    const { status } = body;

    if (status !== "Active" && status !== "Inactive") {
      return NextResponse.json(
        { message: "Status must be Active or Inactive" },
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

    user.status = status;
    await user.save();
    return NextResponse.json({ user: user.toJSON() });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
