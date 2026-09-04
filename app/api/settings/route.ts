import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import {
  getMarketSettings,
  SettingsError,
  updateMarketSettings,
} from "@/lib/actions/settings.actions";
import connectDB from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    await connectDB();
    const settings = await getMarketSettings();
    const auth = await requireAdmin(request);
    if (!isAuthError(auth)) {
      return NextResponse.json({ settings });
    }
    return NextResponse.json({
      settings: {
        marketName: settings.marketName,
        opensAt: settings.opensAt,
        closesAt: settings.closesAt,
        vegetableCategories: settings.vegetableCategories,
      },
    });
  } catch (err) {
    console.error("getSettings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json().catch(() => ({}));
    const settings = await updateMarketSettings({
      vegetableCategories: body.vegetableCategories,
      opensAt: body.opensAt,
      closesAt: body.closesAt,
      marketName: body.marketName,
      offerTemplate: body.offerTemplate,
    });
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof SettingsError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateSettings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
