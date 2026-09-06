import { resolve } from "node:path";
import sharp from "sharp";

const SRC = resolve(process.cwd(), "public/images/hero-farmer-trader.jpg");
const DEST = resolve(process.cwd(), "public/images/hero-farmer-trader.png");

function isBackground(r: number, g: number, b: number): boolean {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  return min >= 228 && max - min <= 30;
}

async function knockout(): Promise<void> {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const pixels = width * height;
  const visited = new Uint8Array(pixels);
  const stack: number[] = [];

  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const i = p * 4;
    if (!isBackground(data[i], data[i + 1], data[i + 2])) return;
    visited[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length > 0) {
    const p = stack.pop()!;
    const x = p % width;
    const y = (p / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  const edge = new Uint8Array(visited);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      if (visited[p]) continue;
      if (
        visited[p - 1] ||
        visited[p + 1] ||
        visited[p - width] ||
        visited[p + width]
      ) {
        edge[p] = 1;
      }
    }
  }

  for (let p = 0; p < pixels; p++) {
    const i = p * 4;
    if (visited[p]) {
      data[i + 3] = 0;
      continue;
    }
    if (edge[p]) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const t = Math.min(1, Math.max(0, (brightness - 175) / 80));
      data[i + 3] = Math.round(255 * (1 - t));
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(DEST);

  console.log(`Wrote ${DEST}`);
}

knockout().catch((error) => {
  console.error(error);
  process.exit(1);
});
