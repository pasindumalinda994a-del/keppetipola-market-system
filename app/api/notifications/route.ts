import { NextResponse } from "next/server";
import { Notification } from "@/database/notification.model";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const notifications = await Notification.find({
      userId: auth.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const unread = await Notification.countDocuments({
      userId: auth.user._id,
      read: false,
    });

    return NextResponse.json({
      notifications: notifications.map((n) => n.toJSON()),
      unread,
    });
  } catch (err) {
    console.error("listNotifications error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => String(id))
      : null;

    const filter: Record<string, unknown> = {
      userId: auth.user._id,
      read: false,
    };
    if (ids?.length) {
      filter._id = { $in: ids };
    }

    await Notification.updateMany(filter, { $set: { read: true } });
    return NextResponse.json({ message: "Notifications updated" });
  } catch (err) {
    console.error("updateNotifications error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
