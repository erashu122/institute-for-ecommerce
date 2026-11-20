import sharp from "sharp";
import { z } from "zod";

export const maxImageBytes = 5 * 1024 * 1024;
export async function normalizeImage(file: File, alt: string) {
  const parsedAlt = z.string().trim().min(1).max(300).parse(alt);
  if (file.size < 1 || file.size > maxImageBytes)
    throw new Error("Images must be between 1 byte and 5 MB.");
  const expected: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/webp": "webp",
  };
  if (!expected[file.type]) throw new Error("Upload PNG, JPEG or WebP images.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const decoder = sharp(bytes, {
    limitInputPixels: 20000000,
    failOn: "warning",
    animated: false,
  });
  const metadata = await decoder.metadata();
  if (metadata.format !== expected[file.type] || (metadata.pages ?? 1) > 1)
    throw new Error(
      "Image contents must match the declared format. Use a single image.",
    );
  const { data, info } = await decoder
    .rotate()
    .resize({
      width: 2000,
      height: 2000,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  return {
    buffer: data,
    width: info.width,
    height: info.height,
    alt: parsedAlt,
  };
}
