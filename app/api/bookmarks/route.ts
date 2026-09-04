import { NextResponse } from "next/server";
import {
  isAuthError,
  requireActiveRole,
} from "@/lib/actions/auth.actions";
import {
  BookmarkError,
  setBookmarks,
} from "@/lib/actions/bookmark.actions";

export async function PUT(request: Request) {
  try {
    const auth = await requireActiveRole(request, ["farmer", "trader", "admin"]);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const body = await request.json();
    await setBookmarks(auth.user, body.vegetableIds);
    return NextResponse.json({ user: auth.user.toJSON() });
  } catch (err) {
    if (err instanceof BookmarkError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("updateBookmarks error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
