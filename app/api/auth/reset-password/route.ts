import { NextResponse } from "next/server";
import {
  PasswordResetError,
  resetPasswordWithCode,
} from "@/lib/actions/password-reset.actions";
import connectDB from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const result = await resetPasswordWithCode({
      email: body.email,
      code: body.code,
      newPassword: body.newPassword,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PasswordResetError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("resetPassword error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
