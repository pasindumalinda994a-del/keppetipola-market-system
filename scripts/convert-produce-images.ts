import { readdir, stat, unlink } from "node:fs/promises";
import { join, parse, resolve } from "node:path";
import sharp from "sharp";

const FOLDERS = [
  "public/Fruit-Images",
  "public/Grain-DryGood-Images",
  "public/Vegitable-Images",
  "public/Leaf-Green-Images",
  "public/Tuber-Images",
] as const;

const SOURCE_EXT = new Set([".jpeg", ".jpg", ".png"]);
const MAX_EDGE = 1600;
const WEBP_QUALITY = 80;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function convertFile(filePath: string): Promise<{ inBytes: number; outBytes: number }> {
  const { dir, name } = parse(filePath);
  const outPath = join(dir, `${name}.webp`);
  const inBytes = (await stat(filePath)).size;

  await sharp(filePath)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outPath);

  const outBytes = (await stat(outPath)).size;
  await unlink(filePath);
  return { inBytes, outBytes };
}

async function convertFolder(relativeDir: string): Promise<void> {
  const dir = resolve(process.cwd(), relativeDir);
  const entries = await readdir(dir, { withFileTypes: true });
  const sources = entries.filter(
    (entry) => entry.isFile() && SOURCE_EXT.has(parse(entry.name).ext.toLowerCase())
  );

  if (sources.length === 0) {
    console.log(`${relativeDir}: no JPEG/PNG files`);
    return;
  }

  let inTotal = 0;
  let outTotal = 0;

  for (const entry of sources) {
    const filePath = join(dir, entry.name);
    try {
      const { inBytes, outBytes } = await convertFile(filePath);
      inTotal += inBytes;
      outTotal += outBytes;
      console.log(
        `  ${entry.name} → ${parse(entry.name).name}.webp (${formatBytes(inBytes)} → ${formatBytes(outBytes)})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  Failed ${entry.name}: ${message}`);
      throw error;
    }
  }

  console.log(
    `${relativeDir}: converted ${sources.length} file(s), ${formatBytes(inTotal)} → ${formatBytes(outTotal)}`
  );
}

async function convertProduceImages(): Promise<void> {
  for (const folder of FOLDERS) {
    await convertFolder(folder);
  }
}

convertProduceImages().catch((error) => {
  console.error(error);
  process.exit(1);
});
