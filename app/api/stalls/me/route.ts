import { NextResponse } from "next/server";
import { isAuthError, requireActiveRole } from "@/lib/actions/auth.actions";
import {
  getStallForTrader,
  StallError,
  upsertTraderStall,
} from "@/lib/actions/stall.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireActiveRole(request, "trader");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const stall = await getStallForTrader(String(auth.user._id));
    return NextResponse.json({ stall });
  } catch (err) {
    console.error("getMyStall error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireActiveRole(request, "trader");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json().catch(() => ({}));
    const stall = await upsertTraderStall(auth.user, {
      name: body.name,
      location: body.location,
      license: body.license,
      contact: body.contact,
    });
    return NextResponse.json({ stall });
  } catch (err) {
    if (err instanceof StallError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("upsertMyStall error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
