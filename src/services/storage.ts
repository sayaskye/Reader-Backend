import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET_NAME = "books-assets";

export class StorageService {
  static async processCover(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  }

  static async uploadImage(buffer: Buffer, options: { fileName: string }) {
    const optimizedBuffer = await this.processCover(buffer);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`covers/${options.fileName}`, optimizedBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) throw new Error(`Error while uploading image: ${error.message}`);

    const { data: publicUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }

  static async uploadEpub(buffer: Buffer, options: { fileName: string }) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`files/${options.fileName}`, buffer, {
        contentType: "application/epub+zip",
        upsert: true,
      });

    if (error) throw new Error(`Error while uploading EPUB: ${error.message}`);

    const { data: publicUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }
}
