import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { signToken } from "@/lib/actions/auth.actions";
import { writeSystemLog } from "@/lib/actions/log.actions";
import { sendPriceBookmarkDigest } from "@/lib/actions/bookmark.actions";
import { User } from "@/database/user.model";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status === "Pending") {
      return NextResponse.json(
        { message: "Your application is awaiting admin approval" },
        { status: 403 }
      );
    }

    if (user.status === "Rejected") {
      const reason = user.rejectionReason?.trim();
      return NextResponse.json(
        {
          message: reason
            ? `Your application was rejected: ${reason}`
            : "Your application was rejected",
        },
        { status: 403 }
      );
    }

    if (user.status !== "Active") {
      return NextResponse.json(
        { message: "Account is inactive" },
        { status: 403 }
      );
    }

    const token = signToken(user._id);
    await writeSystemLog(
      "Login",
      `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} ${user.name} signed in`,
      user.email
    );
    await sendPriceBookmarkDigest(user);
    return NextResponse.json({ user: user.toJSON(), token });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
