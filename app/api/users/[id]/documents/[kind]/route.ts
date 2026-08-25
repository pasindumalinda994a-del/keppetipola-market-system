import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAuthError, requireAdmin } from "@/lib/actions/auth.actions";
import { User } from "@/database/user.model";
import {
  documentFieldForKind,
  isDocumentKind,
  mimeForPath,
  resolveUploadPath,
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

    const relativePath = user[documentFieldForKind(kind)];
    const absolute = relativePath ? resolveUploadPath(relativePath) : null;
    if (!absolute) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    const file = await readFile(absolute);
    return new NextResponse(Uint8Array.from(file), {
      headers: {
        "Content-Type": mimeForPath(absolute),
        "Content-Disposition": `inline; filename="${kind}${path.extname(absolute)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }
    console.error("getUserDocument error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
