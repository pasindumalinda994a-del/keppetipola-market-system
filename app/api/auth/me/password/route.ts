import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = auth.user;
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return NextResponse.json({ message: "Password updated" });
  } catch (err) {
    console.error("changePassword error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
