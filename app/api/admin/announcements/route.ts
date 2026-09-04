import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import {
  AnnouncementError,
  createAnnouncement,
  listAnnouncements,
} from "@/lib/actions/announcement.actions";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const announcements = await listAnnouncements();
    return NextResponse.json({ announcements });
  } catch (err) {
    console.error("listAnnouncements error:", err);
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
    const announcement = await createAnnouncement({
      title: body.title,
      body: body.body,
    });
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (err) {
    if (err instanceof AnnouncementError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("createAnnouncement error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
