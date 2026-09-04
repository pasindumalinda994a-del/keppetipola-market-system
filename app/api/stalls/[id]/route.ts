import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { StallError, updateStall } from "@/lib/actions/stall.actions";
import type { StallStatus } from "@/database/stall.model";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const stall = await updateStall(id, {
      name: body.name,
      location: body.location,
      license: body.license,
      contact: body.contact,
      status: body.status as StallStatus | undefined,
    });
    return NextResponse.json({ stall });
  } catch (err) {
    if (err instanceof StallError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateStall error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
