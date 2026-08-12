import { NextResponse } from "next/server";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) {
    return auth.error;
  }

  return NextResponse.json({ user: auth.user.toJSON() });
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json();
    const { name, phone, address } = body;
    const user = auth.user;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return NextResponse.json(
          { message: "Name is required" },
          { status: 400 }
        );
      }
      user.name = String(name).trim();
    }
    if (phone !== undefined) {
      if (!String(phone).trim()) {
        return NextResponse.json(
          { message: "Phone is required" },
          { status: 400 }
        );
      }
      user.phone = String(phone).trim();
    }
    if (address !== undefined) {
      user.address = String(address).trim();
    }

    await user.save();
    return NextResponse.json({ user: user.toJSON() });
  } catch (err) {
    console.error("updateMe error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
