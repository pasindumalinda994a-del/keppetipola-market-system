import { NextResponse } from "next/server";
import { isAuthError, requireActiveRole } from "@/lib/actions/auth.actions";
import {
  getOrDefaultRule,
  LoyaltyError,
  upsertRule,
} from "@/lib/actions/loyalty.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireActiveRole(request, "trader");
    if (isAuthError(auth)) {
      return auth.error;
    }

    const data = await getOrDefaultRule(String(auth.user._id));
    return NextResponse.json(data);
  } catch (err) {
    console.error("getLoyaltyRule error:", err);
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
    const rule = await upsertRule(auth.user, {
      tokenThreshold: Number(body.tokenThreshold),
      discountPercent: Number(body.discountPercent),
      isActive: Boolean(body.isActive),
    });
    return NextResponse.json({ rule });
  } catch (err) {
    if (err instanceof LoyaltyError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("upsertLoyaltyRule error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
