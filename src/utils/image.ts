import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { configureCloudinary } from "../config/cloudinary.js";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export async function uploadProductImage(file?: Express.Multer.File) {
  if (!file) return null;
  if (!allowedTypes.has(file.mimetype)) throw new Error("La imagen debe ser JPG, PNG, WEBP o GIF.");
  if (file.size > 15 * 1024 * 1024) throw new Error("La imagen no puede pesar más de 15 MB.");
  const buffer = await sharp(file.buffer).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  const cloudinary = configureCloudinary();
  const folder = process.env.CLOUDINARY_FOLDER || "tecnivision/productos";
  return await new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, public_id: randomUUID(), resource_type: "image", format: "webp" }, (error, result) => {
      if (error || !result?.secure_url) reject(error ?? new Error("Cloudinary no devolvió URL.")); else resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}
export async function deleteProductImage(url?: string | null) {
  if (!url?.includes("res.cloudinary.com")) return;
  try {
    const pathname = new URL(url).pathname;
    const after = pathname.split("/image/upload/")[1]?.replace(/^v\d+\//, "");
    const publicId = after?.replace(/\.[^/.]+$/, "");
    if (publicId) await configureCloudinary().uploader.destroy(publicId);
  } catch { /* no bloquear eliminación del producto por limpieza de imagen */ }
}
