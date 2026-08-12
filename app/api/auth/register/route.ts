import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { signToken } from "@/lib/actions/auth.actions";
import { User } from "@/database/user.model";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (role !== "farmer" && role !== "trader") {
      return NextResponse.json(
        { message: "Role must be farmer or trader" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role,
    });

    const token = signToken(user._id);
    return NextResponse.json(
      { user: user.toJSON(), token },
      { status: 201 }
    );
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
