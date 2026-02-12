import * as JSZip from "jszip";
import { parseStringPromise } from "xml2js";

type EpubMetadata = {
  title: string;
  author: string;
  language: string;
  publisher: string;
  description: string;
};

export class EpubService {
  static async extractData(fileBuffer: Buffer): Promise<{
    metadata: EpubMetadata;
    coverBuffer: Buffer | null;
    mimeType: string | null;
  }> {
    const zip = await JSZip.loadAsync(fileBuffer);

    // Load and parse container.xml to locate the OPF file
    const containerXml = await zip.file("META-INF/container.xml")?.async("string");
    if (!containerXml) throw new Error("Invalid EPUB: Missing container.xml");

    const containerJson = await parseStringPromise(containerXml);
    const opfPath: string =
      containerJson.container.rootfiles[0].rootfile[0].$["full-path"];

    // Load and parse OPF
    const opfXml = await zip.file(opfPath)?.async("string");
    if (!opfXml) throw new Error("Invalid EPUB: Missing OPF file");

    const opfJson = await parseStringPromise(opfXml);
    const metadataNode = opfJson.package.metadata[0];
    const manifest: any[] = opfJson.package.manifest[0].item ?? [];

    const metadata: EpubMetadata = {
      title: metadataNode["dc:title"]?.[0] ?? "Unknown title",
      author:
        typeof metadataNode["dc:creator"]?.[0] === "object"
          ? metadataNode["dc:creator"][0]._
          : metadataNode["dc:creator"]?.[0] ?? "Unknown author",
      language: metadataNode["dc:language"]?.[0] ?? "en",
      publisher: metadataNode["dc:publisher"]?.[0] ?? "",
      description: metadataNode["dc:description"]?.[0] ?? "",
    };

    const coverItem = this.findCoverItem(manifest);
    if (!coverItem) {
      return { metadata, coverBuffer: null, mimeType: null };
    }

    const coverPath = this.resolveZipPath(opfPath, coverItem.$.href);
    const coverFile = zip.file(coverPath);

    if (!coverFile) {
      return { metadata, coverBuffer: null, mimeType: null };
    }

    const coverBuffer = Buffer.from(await coverFile.async("arraybuffer"));
    const mimeType = coverItem.$["media-type"] ?? null;

    return { metadata, coverBuffer, mimeType };
  }

  /**
   * Attempts to locate the cover image using EPUB conventions.
   */
  private static findCoverItem(manifest: any[]): any | undefined {
    // 1. EPUB 3 standard: properties="cover-image"
    let item = manifest.find((i) =>
      i.$.properties?.includes("cover-image"),
    );
    if (item) return item;

    // 2. Fallback: look for image items containing "cover" in id or href
    item = manifest.find((i) => {
      const id = i.$.id?.toLowerCase() ?? "";
      const href = i.$.href?.toLowerCase() ?? "";
      const mime = i.$["media-type"]?.toLowerCase() ?? "";

      return mime.startsWith("image/") && (id.includes("cover") || href.includes("cover"));
    });
    if (item) return item;

    // 3. Last fallback: first available image
    return manifest.find((i) =>
      i.$["media-type"]?.startsWith("image/"),
    );
  }

  /**
   * Resolves a relative path inside the EPUB archive.
   */
  private static resolveZipPath(opfPath: string, href: string): string {
    const basePath = opfPath.split("/").slice(0, -1).join("/");
    const cleanHref = href.replace(/^\.\//, "");
    return basePath ? `${basePath}/${cleanHref}` : cleanHref;
  }
}
