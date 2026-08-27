import { NextResponse } from "next/server";
import { Harvest } from "@/database/harvest.model";
import { isAuthError, requireAuth } from "@/lib/actions/auth.actions";
import { getStoredUpload } from "@/lib/uploads";

type Params = { params: Promise<{ id: string; index: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const auth = await requireAuth(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id, index } = await params;
    const photoIndex = Number(index);
    if (!Number.isInteger(photoIndex) || photoIndex < 0) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }

    const harvest = await Harvest.findById(id);
    if (!harvest) {
      return NextResponse.json({ message: "Harvest not found" }, { status: 404 });
    }

    const uploadId = harvest.photos[photoIndex];
    if (!uploadId) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }

    const upload = await getStoredUpload(uploadId);
    if (!upload) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(upload.data), {
      headers: {
        "Content-Type": upload.mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("getHarvestPhoto error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
