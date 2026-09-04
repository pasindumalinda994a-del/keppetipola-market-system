import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import {
  AnnouncementError,
  deleteAnnouncement,
  publishAnnouncement,
  updateAnnouncement,
} from "@/lib/actions/announcement.actions";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (body.status === "Published") {
      const announcement = await publishAnnouncement(id);
      return NextResponse.json({ announcement });
    }

    const announcement = await updateAnnouncement(id, {
      title: body.title,
      body: body.body,
    });
    return NextResponse.json({ announcement });
  } catch (err) {
    if (err instanceof AnnouncementError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateAnnouncement error:", err);
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
    await deleteAnnouncement(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AnnouncementError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("deleteAnnouncement error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
