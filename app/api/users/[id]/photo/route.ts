import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { User } from "@/database/user.model";
import connectDB from "@/lib/mongodb";
import { getStoredUpload } from "@/lib/uploads";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }
    const user = await User.findById(id).select("photoUrl");
    if (!user?.photoUrl) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }

    const upload = await getStoredUpload(user.photoUrl);
    if (!upload) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(upload.data), {
      headers: {
        "Content-Type": upload.mimeType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("getUserPhoto error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
