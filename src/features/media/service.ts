import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";
import { getPrisma } from "../../server/db/client";
import { currentStaff } from "../../server/auth";
import { assertStaff } from "../courses/permissions";
import { normalizeImage } from "./validation";

function storagePath(key: string) {
  const root = process.env.MEDIA_STORAGE_DIR;
  if (!root || !path.isAbsolute(root))
    throw new Error("Configure an absolute MEDIA_STORAGE_DIR.");
  if (!/^[a-f0-9-]+\.webp$/.test(key)) throw new Error("Invalid storage key.");
  return path.join(root, key);
}
export async function uploadImage(file: File, alt: string) {
  assertStaff(await currentStaff());
  const image = await normalizeImage(file, alt);
  const key = randomUUID() + ".webp";
  const target = storagePath(key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, image.buffer, { flag: "wx" });
  try {
    return await getPrisma().mediaAsset.create({
      data: {
        storageKey: key,
        alt: image.alt,
        mimeType: "image/webp",
        byteSize: image.buffer.length,
        width: image.width,
        height: image.height,
      },
    });
  } catch (error) {
    await unlink(target);
    throw error;
  }
}
export async function readImage(id: string) {
  const db = getPrisma();
  let asset = await db.mediaAsset.findFirst({
    where: {
      id,
      OR: [
        { faculty: { some: { status: "PUBLISHED" } } },
        { posts: { some: { status: "PUBLISHED" } } },
        { events: { some: { status: "PUBLISHED" } } },
        { testimonials: { some: { status: "PUBLISHED" } } },
        { faqs: { some: { status: "PUBLISHED" } } },
        { pages: { some: { status: "PUBLISHED" } } },
        { categories: { some: { status: "PUBLISHED" } } },
      ],
    },
  });
  if (!asset && (await currentStaff())?.active)
    asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return null;
  return {
    buffer: await readFile(storagePath(asset.storageKey)),
    mimeType: asset.mimeType,
  };
}

export async function mediaOptions() {
  assertStaff(await currentStaff());
  return getPrisma().mediaAsset.findMany({
    select: { id: true, alt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
