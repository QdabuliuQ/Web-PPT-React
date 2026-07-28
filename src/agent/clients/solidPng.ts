import { deflateSync } from "zlib";

/** CRC32 for PNG chunks */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

/**
 * 无依赖生成纯色 PNG（RGB），用于跳过生图 API 时的布局调试占位。
 */
export function createSolidColorPng(
  width: number,
  height: number,
  rgb: [number, number, number]
): Buffer {
  const w = Math.max(1, Math.min(Math.floor(width), 2048));
  const h = Math.max(1, Math.min(Math.floor(height), 2048));
  const [r, g, b] = rgb.map((v) => Math.max(0, Math.min(255, v | 0))) as [
    number,
    number,
    number,
  ];

  // Each row: filter byte 0 + RGB pixels
  const rowSize = 1 + w * 3;
  const raw = Buffer.alloc(rowSize * h);
  for (let y = 0; y < h; y++) {
    const row = y * rowSize;
    raw[row] = 0; // none filter
    for (let x = 0; x < w; x++) {
      const i = row + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 6 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/** 从 assetKey 派生稳定、易区分的调试色 */
export function colorFromAssetKey(assetKey: string): [number, number, number] {
  let hash = 0;
  for (let i = 0; i < assetKey.length; i++) {
    hash = (hash * 31 + assetKey.charCodeAt(i)) >>> 0;
  }
  const h = hash % 360;
  const s = 0.42;
  const l = 0.55;
  return hslToRgb(h, s, l);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/** 按 aspectRatio 给占位图一个可见尺寸（便于看图位/裁切） */
export function sizeFromAspectRatio(aspectRatio?: string): {
  width: number;
  height: number;
} {
  const raw = (aspectRatio || "auto").trim().toLowerCase();
  if (raw === "auto" || !raw) {
    return { width: 960, height: 540 };
  }

  const px = raw.match(/^(\d+)\s*[x×]\s*(\d+)$/i);
  if (px) {
    return {
      width: Math.min(2048, Math.max(64, Number(px[1]))),
      height: Math.min(2048, Math.max(64, Number(px[2]))),
    };
  }

  const ratio = raw.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  if (ratio) {
    const aw = Number(ratio[1]);
    const ah = Number(ratio[2]);
    if (aw > 0 && ah > 0) {
      const maxSide = 960;
      if (aw >= ah) {
        return {
          width: maxSide,
          height: Math.max(64, Math.round((maxSide * ah) / aw)),
        };
      }
      return {
        width: Math.max(64, Math.round((maxSide * aw) / ah)),
        height: maxSide,
      };
    }
  }

  return { width: 960, height: 540 };
}
