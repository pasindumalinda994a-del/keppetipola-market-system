import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import {
  ContactError,
  deleteContactMessage,
  markContactMessageRead,
} from "@/lib/actions/contact.actions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const message = await markContactMessageRead(id);
    return NextResponse.json({ message });
  } catch (err) {
    if (err instanceof ContactError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateContact error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    await deleteContactMessage(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ContactError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("deleteContact error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
