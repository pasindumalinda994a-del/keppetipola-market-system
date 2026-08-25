import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const DOCUMENT_KINDS = [
  "identityFront",
  "identityBack",
  "taxBill",
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

export function isDocumentKind(value: string): value is DocumentKind {
  return (DOCUMENT_KINDS as readonly string[]).includes(value);
}

export function documentFieldForKind(
  kind: DocumentKind
): "identityFrontUrl" | "identityBackUrl" | "taxBillUrl" {
  if (kind === "identityFront") return "identityFrontUrl";
  if (kind === "identityBack") return "identityBackUrl";
  return "taxBillUrl";
}

export function assertValidUpload(file: unknown, fieldLabel: string): File {
  if (!(typeof File !== "undefined" && file instanceof File) || file.size === 0) {
    throw new UploadError(`${fieldLabel} is required`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(`${fieldLabel} must be 5 MB or smaller`);
  }
  const ext = MIME_TO_EXT[file.type.toLowerCase()];
  if (!ext) {
    throw new UploadError(`${fieldLabel} must be a JPG, PNG, or PDF`);
  }
  return file;
}

export async function saveRegistrationFile(
  userId: string,
  kind: DocumentKind,
  file: File
): Promise<string> {
  const ext = MIME_TO_EXT[file.type.toLowerCase()];
  if (!ext) {
    throw new UploadError("File must be a JPG, PNG, or PDF");
  }

  const dir = path.join(UPLOAD_ROOT, "registrations", userId);
  await mkdir(dir, { recursive: true });
  const filename = `${kind}.${ext}`;
  const absolute = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolute, buffer);
  return path.posix.join("registrations", userId, filename);
}

export function resolveUploadPath(relativePath: string): string | null {
  if (!relativePath) return null;
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized.includes("..")) return null;
  const absolute = path.resolve(UPLOAD_ROOT, normalized);
  const root = path.resolve(UPLOAD_ROOT);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    return null;
  }
  return absolute;
}

export function mimeForPath(filePath: string): string {
  const ext = path.extname(filePath).replace(".", "").toLowerCase();
  return EXT_TO_MIME[ext] || "application/octet-stream";
}

export async function removeRegistrationFiles(userId: string): Promise<void> {
  const dir = path.join(UPLOAD_ROOT, "registrations", userId);
  await Promise.all(
    DOCUMENT_KINDS.flatMap((kind) =>
      ["jpg", "jpeg", "png", "pdf"].map((ext) =>
        unlink(path.join(dir, `${kind}.${ext}`)).catch(() => undefined)
      )
    )
  );
}
