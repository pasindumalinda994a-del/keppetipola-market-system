import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import {
  createStallForTrader,
  listStalls,
  StallError,
} from "@/lib/actions/stall.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const stalls = await listStalls();
    return NextResponse.json({ stalls });
  } catch (err) {
    console.error("listStalls error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json().catch(() => ({}));
    const stall = await createStallForTrader(auth.user, {
      traderId: body.traderId,
      name: body.name,
      location: body.location,
      license: body.license,
      contact: body.contact,
    });
    return NextResponse.json({ stall }, { status: 201 });
  } catch (err) {
    if (err instanceof StallError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("createStall error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
