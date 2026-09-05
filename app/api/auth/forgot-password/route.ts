import { NextResponse } from "next/server";
import {
  PasswordResetError,
  requestPasswordReset,
} from "@/lib/actions/password-reset.actions";
import connectDB from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const result = await requestPasswordReset(body.email);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PasswordResetError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("forgotPassword error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
