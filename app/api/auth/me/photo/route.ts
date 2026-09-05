import { NextResponse } from "next/server";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";
import {
  assertValidImage,
  removeProfilePhoto,
  saveProfilePhoto,
  UploadError,
} from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const form = await request.formData();
    const file = assertValidImage(form.get("photo"), "Profile photo");
    const user = auth.user;
    const previous = user.photoUrl;
    const nextId = await saveProfilePhoto(user._id.toString(), file);
    user.photoUrl = nextId;
    try {
      await user.save();
    } catch (err) {
      await removeProfilePhoto(user._id.toString(), nextId);
      throw err;
    }
    if (previous && previous !== nextId) {
      await removeProfilePhoto(user._id.toString(), previous);
    }
    return NextResponse.json({ user: user.toJSON() });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    console.error("uploadProfilePhoto error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const user = auth.user;
    const previous = user.photoUrl;
    user.photoUrl = "";
    await user.save();
    if (previous) {
      await removeProfilePhoto(user._id.toString(), previous);
    }
    return NextResponse.json({ user: user.toJSON() });
  } catch (err) {
    console.error("removeProfilePhoto error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
