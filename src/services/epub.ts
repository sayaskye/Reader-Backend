import * as JSZip from "jszip";
import { parseStringPromise, processors } from "xml2js";

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

    // 1. Load and parse container.xml to locate the OPF file
    const containerXml = await zip
      .file("META-INF/container.xml")
      ?.async("string");
    if (!containerXml) throw new Error("Invalid EPUB: Missing container.xml");

    const containerJson = await parseStringPromise(containerXml);
    const opfPath: string =
      containerJson.container.rootfiles[0].rootfile[0].$["full-path"];

    // 2. Load and parse OPF with stripPrefix to handle namespaces (opf:, dc:)
    const opfXml = await zip.file(opfPath)?.async("string");
    if (!opfXml) throw new Error("Invalid EPUB: Missing OPF file");

    const opfJson = await parseStringPromise(opfXml, {
      tagNameProcessors: [processors.stripPrefix],
      explicitArray: false,
    });

    const pkg = opfJson.package;
    const metadataNode = pkg.metadata;

    // Normalize manifest items to always be an array
    const manifest: any[] = Array.isArray(pkg.manifest.item)
      ? pkg.manifest.item
      : [pkg.manifest.item];

    // 3. Extract Metadata handling both object and string formats
    const metadata: EpubMetadata = {
      title: metadataNode.title?._ || metadataNode.title || "Unknown title",
      author:
        metadataNode.creator?._ || metadataNode.creator || "Unknown author",
      language: metadataNode.language || "en",
      publisher: metadataNode.publisher || "",
      description: metadataNode.description || "",
    };

    // 4. Find and extract cover image
    const coverItem = this.findCoverItem(manifest);
    if (!coverItem) {
      return { metadata, coverBuffer: null, mimeType: null };
    }

    const coverPath = this.resolveZipPath(opfPath, coverItem.$.href);
    const coverFile = zip.file(coverPath);

    if (!coverFile) {
      // If direct resolve fails, try a desperate search by filename only
      const filename = coverItem.$.href.split("/").pop();
      const fallbackFile = Object.values(zip.files).find((f) =>
        f.name.endsWith(filename),
      );

      if (!fallbackFile) return { metadata, coverBuffer: null, mimeType: null };

      const coverBuffer = Buffer.from(await fallbackFile.async("arraybuffer"));
      return { metadata, coverBuffer, mimeType: coverItem.$["media-type"] };
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
    let item = manifest.find((i) => i.$?.properties?.includes("cover-image"));
    if (item) return item;

    // 2. Fallback: look for image items containing "cover" in id or href
    item = manifest.find((i) => {
      const id = i.$?.id?.toLowerCase() ?? "";
      const href = i.$?.href?.toLowerCase() ?? "";
      const mime = i.$?.["media-type"]?.toLowerCase() ?? "";

      return (
        mime.startsWith("image/") &&
        (id.includes("cover") || href.includes("cover"))
      );
    });
    if (item) return item;

    // 3. Last fallback: first available image
    return manifest.find((i) => i.$?.["media-type"]?.startsWith("image/"));
  }

  /**
   * Resolves a relative path inside the EPUB archive handling backtracking (../)
   */
  private static resolveZipPath(opfPath: string, href: string): string {
    const basePath = opfPath.split("/").slice(0, -1);
    const hrefParts = href.split("/");
    const finalPath = [...basePath];

    for (const part of hrefParts) {
      if (part === "..") {
        finalPath.pop();
      } else if (part !== "." && part !== "") {
        finalPath.push(part);
      }
    }

    return finalPath.join("/");
  }
}
