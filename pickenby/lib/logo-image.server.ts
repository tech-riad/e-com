import "server-only";

import sharp from "sharp";

export type ProcessedLogo = { src: string; width: number; height: number };

const logoCache = new Map<string, Promise<ProcessedLogo | undefined>>();
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PIXELS = 6_000_000;
const BACKGROUND_TOLERANCE = 40;

function colorMatches(data: Buffer, offset: number, color: number[]) {
  return (
    data[offset + 3] > 240 &&
    Math.max(
      Math.abs(data[offset] - color[0]),
      Math.abs(data[offset + 1] - color[1]),
      Math.abs(data[offset + 2] - color[2])
    ) <= BACKGROUND_TOLERANCE
  );
}

async function processLogo(source: string): Promise<ProcessedLogo | undefined> {
  try {
    const sourceUrl = new URL(source);
    const strapiUrl = new URL(process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337");
    if (sourceUrl.origin !== strapiUrl.origin) return undefined;

    const response = await fetch(sourceUrl, { next: { revalidate: 3600 } });
    if (!response.ok) return undefined;

    const input = Buffer.from(await response.arrayBuffer());
    if (input.byteLength > MAX_BYTES) return undefined;

    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    if (width * height > MAX_PIXELS) return undefined;

    const cornerSize = Math.min(8, width, height);
    const cornerSamples: number[][] = [];
    for (const [startX, startY] of [
      [0, 0],
      [width - cornerSize, 0],
      [0, height - cornerSize],
      [width - cornerSize, height - cornerSize],
    ]) {
      for (let y = startY; y < startY + cornerSize; y++) {
        for (let x = startX; x < startX + cornerSize; x++) {
          const offset = (y * width + x) * channels;
          cornerSamples.push([data[offset], data[offset + 1], data[offset + 2], data[offset + 3]]);
        }
      }
    }

    const transparentCorners = cornerSamples.filter((pixel) => pixel[3] < 32).length;
    const background = [0, 1, 2].map((channel) =>
      Math.round(cornerSamples.reduce((sum, pixel) => sum + pixel[channel], 0) / cornerSamples.length)
    );
    const uniformBackground = cornerSamples.every((pixel) =>
      Math.max(
        Math.abs(pixel[0] - background[0]),
        Math.abs(pixel[1] - background[1]),
        Math.abs(pixel[2] - background[2])
      ) <= BACKGROUND_TOLERANCE
    );

    if (transparentCorners < cornerSamples.length * 0.75 && uniformBackground) {
      const visited = new Uint8Array(width * height);
      const queue = new Uint32Array(width * height);
      let head = 0;
      let tail = 0;

      const add = (x: number, y: number) => {
        const point = y * width + x;
        const offset = point * channels;
        if (!visited[point] && colorMatches(data, offset, background)) {
          visited[point] = 1;
          queue[tail++] = point;
        }
      };

      for (let x = 0; x < width; x++) {
        add(x, 0);
        add(x, height - 1);
      }
      for (let y = 0; y < height; y++) {
        add(0, y);
        add(width - 1, y);
      }

      while (head < tail) {
        const point = queue[head++];
        const x = point % width;
        const y = Math.floor(point / width);
        data[point * channels + 3] = 0;
        if (x > 0) add(x - 1, y);
        if (x + 1 < width) add(x + 1, y);
        if (y > 0) add(x, y - 1);
        if (y + 1 < height) add(x, y + 1);
      }
    }

    let left = width;
    let top = height;
    let right = -1;
    let bottom = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * channels + 3] > 8) {
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
    }
    if (right < left || bottom < top) return undefined;

    const padding = 4;
    left = Math.max(0, left - padding);
    top = Math.max(0, top - padding);
    right = Math.min(width - 1, right + padding);
    bottom = Math.min(height - 1, bottom + padding);
    const cropWidth = right - left + 1;
    const cropHeight = bottom - top + 1;
    const output = await sharp(data, { raw: info })
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .png({ compressionLevel: 9 })
      .toBuffer();

    return {
      src: `data:image/png;base64,${output.toString("base64")}`,
      width: cropWidth,
      height: cropHeight,
    };
  } catch {
    return undefined;
  }
}

export function processLogoForHeader(source: string): Promise<ProcessedLogo | undefined> {
  let pending = logoCache.get(source);
  if (!pending) {
    pending = processLogo(source);
    logoCache.set(source, pending);
  }
  return pending;
}