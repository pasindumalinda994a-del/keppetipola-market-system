import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import {
  ContactError,
  createContactMessage,
  listContactMessages,
} from "@/lib/actions/contact.actions";
import connectDB from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const messages = await listContactMessages();
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("listContact error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const message = await createContactMessage({
      name: body.name,
      email: body.email,
      message: body.message,
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    if (err instanceof ContactError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("createContact error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
