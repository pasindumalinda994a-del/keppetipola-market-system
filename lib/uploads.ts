import mongoose from "mongoose";
import { Upload, type UploadKind } from "@/database/upload.model";

export const MAX_FILE_SIZE = Math.round(1.5 * 1024 * 1024);

export const DOCUMENT_KINDS = [
  "identityFront",
  "identityBack",
  "taxBill",
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export type BinaryFile = {
  size: number;
  type: string;
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
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

export function asBinaryFile(value: unknown): BinaryFile | null {
  if (!value || typeof value !== "object") return null;
  const file = value as {
    size?: unknown;
    type?: unknown;
    name?: unknown;
    arrayBuffer?: unknown;
  };
  if (
    typeof file.size !== "number" ||
    typeof file.type !== "string" ||
    typeof file.arrayBuffer !== "function"
  ) {
    return null;
  }
  const read = file.arrayBuffer as () => Promise<ArrayBuffer>;
  return {
    size: file.size,
    type: file.type,
    name: typeof file.name === "string" && file.name ? file.name : "upload",
    arrayBuffer: () => read.call(file),
  };
}

function normalizeMime(type: string): string {
  const mime = type.toLowerCase();
  return mime === "image/jpg" ? "image/jpeg" : mime;
}

function extForMime(mime: string): string | undefined {
  return MIME_TO_EXT[normalizeMime(mime)] ?? MIME_TO_EXT[mime.toLowerCase()];
}

export function assertValidUpload(
  file: unknown,
  fieldLabel: string
): BinaryFile {
  const binary = asBinaryFile(file);
  if (!binary || binary.size === 0) {
    throw new UploadError(`${fieldLabel} is required`);
  }
  if (binary.size > MAX_FILE_SIZE) {
    throw new UploadError(`${fieldLabel} must be 1.5 MB or smaller`);
  }
  if (!extForMime(binary.type)) {
    throw new UploadError(`${fieldLabel} must be a JPG, PNG, or PDF`);
  }
  return binary;
}

export function assertValidImage(
  file: unknown,
  fieldLabel: string
): BinaryFile {
  const binary = asBinaryFile(file);
  if (!binary || binary.size === 0) {
    throw new UploadError(`${fieldLabel} is required`);
  }
  if (binary.size > MAX_FILE_SIZE) {
    throw new UploadError(`${fieldLabel} must be 1.5 MB or smaller`);
  }
  const mime = normalizeMime(binary.type);
  if (mime !== "image/jpeg" && mime !== "image/png") {
    throw new UploadError(`${fieldLabel} must be a JPG or PNG`);
  }
  return binary;
}

async function saveUpload(options: {
  ownerType: "registration" | "harvest";
  ownerId: string;
  kind: UploadKind;
  file: BinaryFile;
}): Promise<string> {
  const mimeType = normalizeMime(options.file.type);
  const ext = extForMime(mimeType);
  if (!ext) {
    throw new UploadError("File must be a JPG, PNG, or PDF");
  }

  const doc = await Upload.create({
    ownerType: options.ownerType,
    ownerId: options.ownerId,
    kind: options.kind,
    mimeType,
    filename: options.file.name || `${options.kind}.${ext}`,
    data: Buffer.from(await options.file.arrayBuffer()),
  });

  return doc._id.toString();
}

export async function saveHarvestPhoto(
  harvestId: string,
  index: number,
  file: BinaryFile
): Promise<string> {
  const mime = normalizeMime(file.type);
  if (mime !== "image/jpeg" && mime !== "image/png") {
    throw new UploadError("Photo must be a JPG or PNG");
  }
  return saveUpload({
    ownerType: "harvest",
    ownerId: harvestId,
    kind: "photo",
    file: {
      ...file,
      name: file.name || `photo-${index}.${extForMime(mime)}`,
    },
  });
}

export async function saveRegistrationFile(
  userId: string,
  kind: DocumentKind,
  file: BinaryFile
): Promise<string> {
  return saveUpload({
    ownerType: "registration",
    ownerId: userId,
    kind,
    file,
  });
}

export async function getStoredUpload(id: string) {
  if (!id || !mongoose.isValidObjectId(id)) return null;
  const doc = await Upload.findById(id).select("+data");
  if (!doc?.data) return null;
  return doc;
}

export async function removeRegistrationFiles(userId: string): Promise<void> {
  if (!userId || !mongoose.isValidObjectId(userId)) return;
  await Upload.deleteMany({ ownerType: "registration", ownerId: userId });
}

export async function removeHarvestFiles(harvestId: string): Promise<void> {
  if (!harvestId || !mongoose.isValidObjectId(harvestId)) return;
  await Upload.deleteMany({ ownerType: "harvest", ownerId: harvestId });
}

export function filenameForKind(kind: string, mimeType: string, stored?: string) {
  if (stored && !stored.includes("/") && !stored.includes("\\")) {
    return stored.replace(/"/g, "");
  }
  const ext = extForMime(mimeType) || "bin";
  return `${kind}.${ext}`;
}
