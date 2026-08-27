export class CompressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompressError";
  }
}

const MAX_EDGE = 1600;
const TARGET_BYTES = 700 * 1024;
const PDF_MAX_BYTES = 1024 * 1024;
const REGISTRATION_TOTAL_MAX = 4 * 1024 * 1024;
const HARVEST_TOTAL_MAX = 4 * 1024 * 1024;

function mimeFromFile(file: File): string {
  const type = file.type.toLowerCase();
  if (type) return type === "image/jpg" ? "image/jpeg" : type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "pdf") return "application/pdf";
  return "";
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new CompressError("Could not process image"));
          return;
        }
        return resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

async function compressImageFile(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new CompressError("Could not read image. Use a JPG or PNG.");
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * scale));
    let height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new CompressError("Could not process image");
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bitmap, 0, 0, width, height);

    let quality = 0.72;
    let blob = await canvasToBlob(canvas, quality);
    while (blob.size > TARGET_BYTES && quality > 0.45) {
      quality -= 0.08;
      blob = await canvasToBlob(canvas, quality);
    }

    if (blob.size > TARGET_BYTES) {
      const factor = Math.sqrt(TARGET_BYTES / blob.size);
      width = Math.max(1, Math.round(width * factor));
      height = Math.max(1, Math.round(height * factor));
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(bitmap, 0, 0, width, height);
      blob = await canvasToBlob(canvas, 0.65);
    }

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

export async function prepareUploadFile(
  file: File,
  fieldLabel: string,
  options: { allowPdf?: boolean } = {}
): Promise<File> {
  const type = mimeFromFile(file);

  if (type === "application/pdf") {
    if (!options.allowPdf) {
      throw new CompressError(`${fieldLabel} must be a JPG or PNG`);
    }
    if (file.size > PDF_MAX_BYTES) {
      throw new CompressError(`${fieldLabel} PDF must be 1 MB or smaller`);
    }
    return file;
  }

  if (
    type !== "image/jpeg" &&
    type !== "image/jpg" &&
    type !== "image/png"
  ) {
    throw new CompressError(
      options.allowPdf
        ? `${fieldLabel} must be a JPG, PNG, or PDF`
        : `${fieldLabel} must be a JPG or PNG`
    );
  }

  return compressImageFile(file);
}

export async function prepareRegistrationFiles(files: {
  identityFront: File;
  identityBack: File;
  taxBill: File;
}): Promise<{
  identityFront: File;
  identityBack: File;
  taxBill: File;
}> {
  const identityFront = await prepareUploadFile(
    files.identityFront,
    "Identity photo (front)",
    { allowPdf: true }
  );
  const identityBack = await prepareUploadFile(
    files.identityBack,
    "Identity photo (back)",
    { allowPdf: true }
  );
  const taxBill = await prepareUploadFile(files.taxBill, "Tax bill photo", {
    allowPdf: true,
  });

  const total = identityFront.size + identityBack.size + taxBill.size;
  if (total > REGISTRATION_TOTAL_MAX) {
    throw new CompressError(
      "Documents are too large. Use smaller photos or PDFs under 1 MB."
    );
  }

  return { identityFront, identityBack, taxBill };
}

export async function prepareHarvestPhotos(files: File[]): Promise<File[]> {
  const photos: File[] = [];
  for (let i = 0; i < files.length; i += 1) {
    photos.push(await prepareUploadFile(files[i], `Photo ${i + 1}`));
  }

  const total = photos.reduce((sum, file) => sum + file.size, 0);
  if (total > HARVEST_TOTAL_MAX) {
    throw new CompressError(
      "Photos are too large. Use fewer or smaller images."
    );
  }

  return photos;
}
