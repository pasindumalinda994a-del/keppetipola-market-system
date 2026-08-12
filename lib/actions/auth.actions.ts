import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User, type UserDocument } from "@/database/user.model";

type AuthSuccess = { user: UserDocument };
type AuthFailure = { error: NextResponse };

export function signToken(userId: string | { toString(): string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign(
    { id: userId.toString() },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
  );
}

export async function requireAuth(
  request: Request
): Promise<AuthSuccess | AuthFailure> {
  try {
    await connectDB();

    const header = request.headers.get("authorization");
    if (!header || !header.startsWith("Bearer ")) {
      return {
        error: NextResponse.json({ message: "Not authorized" }, { status: 401 }),
      };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return {
        error: NextResponse.json({ message: "Server error" }, { status: 500 }),
      };
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return {
        error: NextResponse.json({ message: "Not authorized" }, { status: 401 }),
      };
    }

    return { user };
  } catch {
    return {
      error: NextResponse.json({ message: "Not authorized" }, { status: 401 }),
    };
  }
}

export async function requireAdmin(
  request: Request
): Promise<AuthSuccess | AuthFailure> {
  const result = await requireAuth(request);
  if ("error" in result) {
    return result;
  }

  if (result.user.role !== "admin") {
    return {
      error: NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return result;
}

export function isAuthError(
  result: AuthSuccess | AuthFailure
): result is AuthFailure {
  return "error" in result;
}
