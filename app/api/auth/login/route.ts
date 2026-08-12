import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { signToken } from "@/lib/actions/auth.actions";
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

    if (user.status !== "Active") {
      return NextResponse.json(
        { message: "Account is inactive" },
        { status: 403 }
      );
    }

    const token = signToken(user._id);
    return NextResponse.json({ user: user.toJSON(), token });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
