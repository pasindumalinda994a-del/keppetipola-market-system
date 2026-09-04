import { NextResponse } from "next/server";
import {
  isAuthError,
  requireActiveRole,
} from "@/lib/actions/auth.actions";
import { getSalesReport } from "@/lib/actions/report.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireActiveRole(request, ["admin", "trader"]);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const traderId =
      auth.user.role === "trader" ? String(auth.user._id) : undefined;
    const report = await getSalesReport(traderId);
    return NextResponse.json(report);
  } catch (err) {
    console.error("getReports error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
