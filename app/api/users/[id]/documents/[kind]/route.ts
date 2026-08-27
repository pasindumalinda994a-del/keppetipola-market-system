import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { User } from "@/database/user.model";
import {
  documentFieldForKind,
  filenameForKind,
  getStoredUpload,
  isDocumentKind,
} from "@/lib/uploads";

type Params = { params: Promise<{ id: string; kind: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) {
      return auth.error;
    }

    const { id, kind } = await params;
    if (!isDocumentKind(kind)) {
      return NextResponse.json(
        { message: "Invalid document type" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const uploadId = user[documentFieldForKind(kind)];
    const upload = uploadId ? await getStoredUpload(uploadId) : null;
    if (!upload) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    const filename = filenameForKind(kind, upload.mimeType, upload.filename);
    return new NextResponse(new Uint8Array(upload.data), {
      headers: {
        "Content-Type": upload.mimeType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("getUserDocument error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
