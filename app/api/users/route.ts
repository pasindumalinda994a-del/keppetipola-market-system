import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { User } from "@/database/user.model";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const users = await User.find().sort({ joinedAt: -1 });
    return NextResponse.json({ users: users.map((u) => u.toJSON()) });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
