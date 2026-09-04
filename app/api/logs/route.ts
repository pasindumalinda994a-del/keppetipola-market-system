import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { listSystemLogs } from "@/lib/actions/log.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const logs = await listSystemLogs({
      type: searchParams.get("type") || undefined,
      user: searchParams.get("user") || undefined,
    });
    return NextResponse.json({ logs });
  } catch (err) {
    console.error("listLogs error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
